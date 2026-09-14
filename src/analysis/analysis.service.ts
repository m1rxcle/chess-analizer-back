import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { GameParamDto } from 'src/common/dto/game-param.dto'
import { assessmentOfMovementQuality } from 'src/common/utils/assessment-of-movement-quality.utils'
import { evalLoss } from 'src/common/utils/eval-loss.utils'
import { getWhitePerspectiveEvaluation } from 'src/common/utils/get-white-perspective-evaluation.utils'
import { normalizeGameScore } from 'src/common/utils/normalize-game-score.util'
import { GamesService } from 'src/games/games.service'
import { parsePgn } from 'src/games/parsers/game-pgn.parser'
import { StockfishService } from 'src/stockfish/stockfish.service'
import type { TStockfishAnalysis } from 'src/stockfish/types/stockfish-analysis.type'

import type { TAnalyzeMove } from './types/analyze-move.type'

@Injectable()
export class AnalysisService {
	public constructor(
		private readonly configService: ConfigService,
		private readonly gamesService: GamesService,
		private readonly stockfishService: StockfishService
	) {}

	public async analyzeMoves(dto: GameParamDto) {
		const game = await this.gamesService.getGameFromChessCom(dto)

		const moves = parsePgn(game)

		const result: TAnalyzeMove[] = []

		let previousAnalysis: TStockfishAnalysis | null = null

		for (const [index, move] of moves.entries()) {
			const analysis =
				previousAnalysis ??
				(await this.stockfishService.analyzeFen(move.fenBefore))

			const scoreAfterMove = await this.stockfishService.analyzeFen(
				move.fenAfter
			)

			previousAnalysis = scoreAfterMove

			const sideAfter = move.color === 'white' ? 'black' : 'white'

			const whiteScoreBefore = getWhitePerspectiveEvaluation(
				analysis.score,
				analysis.mate,
				move.color
			)

			const whiteScoreAfter = getWhitePerspectiveEvaluation(
				scoreAfterMove.score,
				scoreAfterMove.mate,
				sideAfter
			)

			const blackScoreBefore = -whiteScoreBefore
			const blackScoreAfter = -whiteScoreAfter

			const accuracy = evalLoss(
				move.color,
				whiteScoreBefore,
				whiteScoreAfter
			)

			const isBestMove = move.uci === analysis.bestmove

			const quality = assessmentOfMovementQuality(accuracy, isBestMove)

			result.push({
				move: index + 1,
				color: move.color,
				playerMove: move.uci,
				bestMove: analysis.bestmove,
				whiteScoreBefore,
				whiteScoreAfter,
				blackScoreBefore,
				blackScoreAfter,
				gameScoreBefore: normalizeGameScore(whiteScoreBefore),
				gameScoreAfter: normalizeGameScore(whiteScoreAfter),
				mate: scoreAfterMove.mate,
				evalLoss: accuracy,
				quality,
				isBestMove
			})
		}

		return result
	}
}
