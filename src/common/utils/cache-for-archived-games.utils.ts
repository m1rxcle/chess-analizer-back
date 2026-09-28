import type { TGame } from '../../chesscom/types/game.type'

type TCacheForArchivedGames = {
	games: TGame[]
	totalGames: number
	expiresAt: number
}

export const cacheForArchivedGames = new Map<string, TCacheForArchivedGames>()
