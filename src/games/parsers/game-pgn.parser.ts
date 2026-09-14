import { Chess } from 'chess.js'
import type { TGame } from 'src/chesscom/types/game.type'

import type { TParsedMove } from './types/parsed-move'

export function parsePgn(game: TGame): TParsedMove[] {
	const chess = new Chess()

	chess.loadPgn(game.pgn)

	const moves = chess.history({ verbose: true })

	const replay = new Chess()

	return moves.map((move, index) => {
		const fenBefore = replay.fen()

		replay.move(move)

		const fenAfter = replay.fen()

		return {
			moveNumber: Math.floor(index / 2) + 1,
			color: move.color === 'w' ? 'white' : 'black',
			san: move.san,
			uci: `${move.from}${move.to}`,
			fenBefore,
			fenAfter
		}
	})
}
