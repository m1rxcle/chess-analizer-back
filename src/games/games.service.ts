import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ChesscomService } from 'src/chesscom/chesscom.service'
import type { GameParamDto } from 'src/common/dto/game-param.dto'

@Injectable()
export class GamesService {
	public constructor(
		private readonly configService: ConfigService,
		private readonly chesscomService: ChesscomService
	) {}

	public async getGameFromChessCom(dto: GameParamDto) {
		const { username, gameId } = dto
		const chessComFlatGames =
			await this.chesscomService.getGamesByUsername(username)

		const game = chessComFlatGames.find(game => game.uuid === gameId)

		if (!game) {
			throw new NotFoundException('Game was not found')
		}

		return game
	}
}
