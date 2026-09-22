import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { cacheForArchivedGames } from 'src/common/utils/cache-for-archived-games.utils'

import type { TGame } from './types/game.type'
import { TPaginateGames } from './types/paginate-games'
import type { TArchivesMonthByUsernameResponse } from './types/response/archived-months-by-username-response.type'
import type { TMonthlyGameResponse } from './types/response/monthly-games-response.type'

const nativeFetch = globalThis.fetch.bind(globalThis)
const MONTH_FETCH_CONCURRENCY = 3

@Injectable()
export class ChesscomService {
	public constructor(private readonly configService: ConfigService) {}

	private readonly inflightLoads = new Map<string, Promise<TGame[]>>()

	public async getGamesByUsername(
		username: string,
		page: number = 1,
		limit: number = 50
	) {
		const games = await this.getAllGamesByUsername(username)

		return this.paginateGames(games, page, limit, games.length)
	}

	public async getGameByUsernameAndId(username: string, gameId: string) {
		const games = await this.getAllGamesByUsername(username)

		const game = games.find(item => item.uuid === gameId)

		if (!game) {
			throw new NotFoundException(
				'Игра была не найдена, попробуйте другую'
			)
		}

		return game
	}

	private async getAllGamesByUsername(username: string): Promise<TGame[]> {
		const url = `${this.configService.getOrThrow<string>('CHESS_COM_PLAYER_GAMES')}${username}/games/archives`

		const cached = this.getCache(url)

		if (cached) {
			return cached.games
		}

		const inflight = this.inflightLoads.get(url)

		if (inflight) {
			return inflight
		}

		const load = this.fetchAllGames(url).finally(() => {
			this.inflightLoads.delete(url)
		})

		this.inflightLoads.set(url, load)

		return load
	}

	private async fetchAllGames(url: string): Promise<TGame[]> {
		const response = await nativeFetch(url, {
			method: 'GET'
		})

		if (response.status === 404) {
			throw new NotFoundException('Пользователь не найден')
		}

		if (!response.ok) {
			throw new BadRequestException(
				'[Archives] Chess.com API error: ' + response.status
			)
		}

		const result =
			(await response.json()) as TArchivesMonthByUsernameResponse

		if (result.archives.length === 0) {
			throw new NotFoundException('Пользователь не найден')
		}

		const monthlyGames = await this.mapPool(
			result.archives,
			MONTH_FETCH_CONCURRENCY,
			async month => {
				const monthGamesResponse = await nativeFetch(month, {
					method: 'GET'
				})

				if (!monthGamesResponse.ok) {
					throw new BadRequestException(
						'[Games] Chess.com API error: ' +
							monthGamesResponse.status
					)
				}

				const monthGames =
					(await monthGamesResponse.json()) as TMonthlyGameResponse

				return monthGames.games
			}
		)

		const flatGames = monthlyGames
			.flat()
			.sort((a, b) => Number(b.end_time) - Number(a.end_time))

		this.setCache(url, flatGames, flatGames.length, 1000 * 60 * 10)

		return flatGames
	}

	private async mapPool<T, R>(
		items: T[],
		limit: number,
		mapper: (item: T) => Promise<R>
	): Promise<R[]> {
		const results: R[] = new Array(items.length)
		let nextIndex = 0

		const worker = async () => {
			while (nextIndex < items.length) {
				const currentIndex = nextIndex++
				results[currentIndex] = await mapper(items[currentIndex])
			}
		}

		await Promise.all(
			Array.from(
				{ length: Math.min(limit, items.length) },
				() => worker()
			)
		)

		return results
	}

	private paginateGames(
		games: TGame[],
		page: number,
		limit: number,
		totalGames: number
	): TPaginateGames {
		const start = (page - 1) * limit

		const end = start + limit

		const paginatedGames = games.slice(start, end)

		return {
			games: paginatedGames,
			page,
			limit,
			hasNextPage: end < games.length,
			totalGames
		}
	}

	private getCache(key: string) {
		const entry = cacheForArchivedGames.get(key)

		if (!entry) return null

		if (Date.now() > entry.expiresAt) {
			cacheForArchivedGames.delete(key)
			return null
		}

		return {
			games: entry.games,
			totalGames: entry.totalGames
		}
	}

	private setCache(
		key: string,
		games: TGame[],
		totalGames: number,
		ttl: number
	) {
		cacheForArchivedGames.set(key, {
			games,
			totalGames,
			expiresAt: Date.now() + ttl
		})
	}
}
