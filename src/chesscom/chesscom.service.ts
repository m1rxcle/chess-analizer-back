import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { cacheForArchivedGames } from 'src/common/utils/cache-for-archived-games.utils'

import type { TGame } from './types/game.type'
import type { TArchivesMonthByUsernameResponse } from './types/response/archived-months-by-username-response.type'
import type { TMonthlyGameResponse } from './types/response/monthly-games-response.type'

@Injectable()
export class ChesscomService {
	public constructor(private readonly configService: ConfigService) {}

	public async getGamesByUsername(
		username: string,
		page: number = 1,
		limit: number = 50
	) {
		const url = `${this.configService.getOrThrow<string>('CHESS_COM_PLAYER_GAMES')}${username}/games/archives`

		const cached = this.getCache(url)

		if (cached) {
			return this.paginateGames(
				cached.games,
				page,
				limit,
				cached.totalGames
			)
		}

		const response = await fetch(url, {
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

		const games = await Promise.all(
			result.archives.map(async month => {
				const monthGamesResponse = await fetch(month, {
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
			})
		)

		const flatGames = games
			.flat()
			.sort((a, b) => Number(b.end_time) - Number(a.end_time))

		const totalGames = flatGames.length

		this.setCache(url, flatGames, totalGames, 1000 * 60 * 10)

		return this.paginateGames(flatGames, page, limit, totalGames)
	}

	private paginateGames(
		games: TGame[],
		page: number,
		limit: number,
		totalGames: number
	) {
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
