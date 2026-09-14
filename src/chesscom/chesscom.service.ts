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

	public async getGamesByUsername(username: string) {
		const url = `${this.configService.getOrThrow<string>('CHESS_COM_PLAYER_GAMES')}${username}/games/archives`

		const cached = this.getCache(url)

		if (cached) {
			return cached
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

		const flatGames = games.flat()

		this.setCache(url, flatGames, 1000 * 60 * 10)

		return flatGames
	}

	private getCache(key: string) {
		const entry = cacheForArchivedGames.get(key)

		if (!entry) return null

		if (Date.now() > entry.expiresAt) {
			cacheForArchivedGames.delete(key)
			return null
		}

		return entry.value
	}

	private setCache(key: string, value: TGame[], ttl: number) {
		cacheForArchivedGames.set(key, {
			value,
			expiresAt: Date.now() + ttl
		})
	}
}
