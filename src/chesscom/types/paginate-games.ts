import { TGame } from './game.type'

export type TPaginateGames = {
	games: TGame[]
	page: number
	limit: number
	hasNextPage: boolean
	totalGames: number
}
