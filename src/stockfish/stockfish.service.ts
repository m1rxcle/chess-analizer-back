import { Injectable, NotFoundException } from '@nestjs/common'
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
	public constructor(
		private readonly configService: ConfigService,
		private readonly gamesService: GamesService
	) {}

	private engine: Awaited<ReturnType<typeof stockfish>> | null = null

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
		console.log('🔥 ANALYZE FEN:', fen)

		const engine = await this.getEngine()

		return new Promise<TStockfishAnalysis>((resolve, reject) => {
			const analysis: TStockfishAnalysis = {
				bestmove: '',
				score: 0,
				depth: 0,
				pv: [] as string[]
			}

			engine.listener = (message: string) => {
				console.log('Ответ от Stockfish:', message)

				if (message.startsWith('error')) {
					reject(new Error(message))
				}

				if (message.startsWith('info depth')) {
					console.log('Информация о глубине:', message)

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
					console.log('Лучший ход:', message)
					analysis.bestmove = message.split(' ')[1]

					resolve(analysis)
				}
			}

			engine.sendCommand(`position fen ${fen}`)
			engine.sendCommand('go depth 16')
		})
	}

	private async getEngine() {
		console.log('GET ENGINE:', this.engine ? 'EXIST' : 'CREATE')
		if (!this.engine) {
			this.engine = await stockfish('lite-single')
		}

		return this.engine
	}

	private async getGame(dto: GameParamDto) {
		return await this.gamesService.getGameFromChessCom(dto)
	}
}
