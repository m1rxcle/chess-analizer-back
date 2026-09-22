import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { GameParamDto } from 'src/common/dto/game-param.dto'
import { assessmentOfMovementQuality } from 'src/common/utils/assessment-of-movement-quality.utils'
import { evalLoss } from 'src/common/utils/eval-loss.utils'
import { getWhitePerspectiveEvaluation } from 'src/common/utils/get-white-perspective-evaluation.utils'
import { GamesService } from 'src/games/games.service'
import { parsePgn } from 'src/games/parsers/game-pgn.parser'
import stockfish from 'stockfish'

import type { TStockfishAnalysisResponse } from './types/stockfish-analysis-response.type'
import type { TStockfishAnalysis } from './types/stockfish-analysis.type'

@Injectable()
export class StockfishService {
	private readonly logger = new Logger('Stockfish')

	public constructor(
		private readonly configService: ConfigService,
		private readonly gamesService: GamesService
	) {}

	private engine: Awaited<ReturnType<typeof stockfish>> | null = null
	private engineInit: Promise<Awaited<ReturnType<typeof stockfish>>> | null =
		null
	private analysisQueue: Promise<void> = Promise.resolve()
	private pendingJobs = 0
	private readonly fenInflight = new Map<
		string,
		Promise<TStockfishAnalysis>
	>()

	public async stockfishAnalysis(
		dto: GameParamDto,
		move: number = 0
	): Promise<TStockfishAnalysisResponse> {
		const game = await this.getGame(dto)

		const moves = parsePgn(game)

		if (!moves.length) {
			throw new NotFoundException('Game was not found')
		}

		const index = Math.max(0, Math.min(move - 1, moves.length - 1))

		const currentMove = moves[index]
		const side = currentMove.color === 'white' ? 'белые' : 'чёрные'

		this.logger.log(
			`Разбор хода ${move}  ·  ${side}  ·  сыграли ${currentMove.uci} (${currentMove.san})`
		)

		const analysisBefore = await this.analyzeFen(currentMove.fenBefore)
		const analysisAfter = await this.analyzeFen(currentMove.fenAfter)

		const isBestMove = currentMove.uci === analysisBefore.bestmove

		const whiteScoreBefore = getWhitePerspectiveEvaluation(
			analysisBefore.score,
			analysisBefore.mate,
			currentMove.color
		)

		const sideAfter = currentMove.color === 'white' ? 'black' : 'white'

		const whiteScoreAfter = getWhitePerspectiveEvaluation(
			analysisAfter.score,
			analysisAfter.mate,
			sideAfter
		)

		const accuracy = evalLoss(
			currentMove.color,
			whiteScoreBefore,
			whiteScoreAfter
		)

		const quality = assessmentOfMovementQuality(accuracy, isBestMove)

		this.logger.log(
			`  сыграли ${currentMove.uci}  |  лучший ${analysisBefore.bestmove}  |  ответ ${analysisAfter.bestmove}`
		)
		this.logger.log(
			`  оценка ${formatEval(analysisBefore.score, analysisBefore.mate)} → ${formatEval(analysisAfter.score, analysisAfter.mate)}  |  глубина ${analysisBefore.depth}  |  ${quality}`
		)

		return {
			move: move,
			playerMove: currentMove.uci,
			bestMove: analysisBefore.bestmove,
			responseMove: analysisAfter.bestmove,
			scoreBefore: analysisBefore.score,
			scoreAfter: analysisAfter.score,
			quality,
			depthBefore: analysisBefore.depth,
			depthAfter: analysisAfter.depth,
			pvBefore: analysisBefore.pv,
			pvAfter: analysisAfter.pv,
			mateBefore: analysisBefore.mate,
			mateAfter: analysisAfter.mate
		}
	}

	public async getPosition(move: number, dto: GameParamDto) {
		const game = await this.getGame(dto)

		const moves = parsePgn(game)

		if (move <= 0 || isNaN(move)) {
			return moves[0]
		}

		if (move >= moves.length) {
			return moves[moves.length - 1]
		}

		return moves[move - 1]
	}

	public async analyzeFen(fen: string) {
		const inflight = this.fenInflight.get(fen)

		if (inflight) {
			return inflight
		}

		const analysis = this.enqueueAnalysis(() =>
			this.runAnalysis(fen)
		).finally(() => {
			this.fenInflight.delete(fen)
		})

		this.fenInflight.set(fen, analysis)

		return analysis
	}

	private enqueueAnalysis<T>(task: () => Promise<T>): Promise<T> {
		this.pendingJobs += 1

		if (this.pendingJobs > 1) {
			this.logger.log(
				`Движок занят, в очереди ещё ${this.pendingJobs - 1}`
			)
		}

		const run = this.analysisQueue.then(task, task)

		this.analysisQueue = run.then(
			() => {
				this.pendingJobs = Math.max(0, this.pendingJobs - 1)
			},
			() => {
				this.pendingJobs = Math.max(0, this.pendingJobs - 1)
			}
		)

		return run
	}

	private async runAnalysis(fen: string) {
		const engine = await this.getEngine()

		return new Promise<TStockfishAnalysis>((resolve, reject) => {
			const analysis: TStockfishAnalysis = {
				bestmove: '',
				score: 0,
				depth: 0,
				pv: [] as string[]
			}

			let settled = false

			const finish = (
				handler: (
					value: TStockfishAnalysis | PromiseLike<TStockfishAnalysis>
				) => void,
				value: TStockfishAnalysis
			) => {
				if (settled) return
				settled = true
				engine.listener = undefined
				handler(value)
			}

			const fail = (error: Error) => {
				if (settled) return
				settled = true
				engine.listener = undefined
				reject(error)
			}

			const timeout = setTimeout(() => {
				try {
					engine.sendCommand('stop')
				} catch {
					this.resetEngine()
				}

				this.logger.error('Таймаут: движок не ответил за 20 секунд')
				fail(new Error('Stockfish analysis timeout'))
			}, 20000)

			engine.listener = (message: string) => {
				if (message.startsWith('info depth')) {
					const parts = message.split(' ')

					const depthIndex = parts.indexOf('depth')
					const scoreIndex = parts.indexOf('score')
					const pvIndex = parts.indexOf('pv')

					if (depthIndex !== -1) {
						const scoreType = parts[scoreIndex + 1]
						const scoreValue = Number(parts[scoreIndex + 2])

						analysis.depth = Number(parts[depthIndex + 1])

						if (scoreType === 'cp') {
							analysis.score = scoreValue / 100
						}

						if (scoreType === 'mate') {
							analysis.mate = scoreValue
						}
					}

					if (pvIndex !== -1) {
						analysis.pv = parts.slice(pvIndex + 1)
					}
				}

				if (message.startsWith('bestmove')) {
					clearTimeout(timeout)
					analysis.bestmove = message.split(' ')[1]
					finish(resolve, analysis)
				}
			}

			try {
				engine.sendCommand(`position fen ${fen}`)
				engine.sendCommand('go depth 16')
			} catch (error) {
				clearTimeout(timeout)
				this.resetEngine()
				fail(
					error instanceof Error
						? error
						: new Error('Stockfish command failed')
				)
			}
		})
	}

	private async getEngine() {
		if (this.engine) {
			return this.engine
		}

		if (!this.engineInit) {
			this.engineInit = this.createEngine().catch(error => {
				this.resetEngine()
				throw error
			})
		}

		this.engine = await this.engineInit

		return this.engine
	}

	private async createEngine() {
		const originalFetch = globalThis.fetch

		this.logger.log('────────────────────────────────────────')
		this.logger.log('Запускаю движок  ·  Stockfish lite-single')

		try {
			const engine = await stockfish('lite-single')
			await this.configureEngine(engine)
			this.logger.log('Движок готов  ·  Hash 16 МБ  ·  1 поток')
			this.logger.log('────────────────────────────────────────')
			return engine
		} catch (error) {
			this.logger.error('Не удалось запустить движок', error)
			throw error
		} finally {
			globalThis.fetch = originalFetch
		}
	}

	private configureEngine(
		engine: Awaited<ReturnType<typeof stockfish>>
	): Promise<void> {
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error('Stockfish init timeout'))
			}, 15000)

			engine.listener = (message: string) => {
				if (message === 'uciok') {
					engine.sendCommand('setoption name Hash value 16')
					engine.sendCommand('setoption name Threads value 1')
					engine.sendCommand('isready')
					return
				}

				if (message !== 'readyok') return

				clearTimeout(timeout)
				engine.listener = undefined
				resolve()
			}

			engine.sendCommand('uci')
		})
	}

	private resetEngine() {
		this.logger.warn(
			'Сбрасываю движок, при следующем анализе подниму заново'
		)
		this.engine = null
		this.engineInit = null
	}

	private async getGame(dto: GameParamDto) {
		return await this.gamesService.getGameFromChessCom(dto)
	}
}

function formatEval(score: number, mate?: number) {
	if (mate) {
		return `мат ${mate}`
	}

	const sign = score > 0 ? '+' : ''
	return `${sign}${score.toFixed(2)}`
}
