import type { TGame } from 'src/chesscom/types/game.type'

type TCacheForArchivedGames = {
	value: TGame[]
	expiresAt: number
}

export const cacheForArchivedGames = new Map<string, TCacheForArchivedGames>()
