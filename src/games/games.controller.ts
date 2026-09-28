import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common'
import { ApiNotFoundResponse, ApiOkResponse, ApiParam } from '@nestjs/swagger'

import { GameParamDto } from '../common/dto/game-param.dto'
import { GetGameResponseDto } from '../common/dto/get-game.dto'

import { GamesService } from './games.service'

@Controller('games')
export class GamesController {
	constructor(private readonly gamesService: GamesService) {}

	@Get(':username/:gameId')
	@HttpCode(HttpStatus.OK)
	@ApiParam({
		name: 'gameId',
		description: 'ID конкретной партии с chess.com',
		type: String,
		example: '12aer-vvc23-sps-123'
	})
	@ApiParam({
		name: 'username',
		description: 'Имя игрока с chess.com',
		type: String,
		example: 'GothamChess'
	})
	@ApiOkResponse({
		type: GetGameResponseDto,
		description: 'Сервис вернет данные без сообщения'
	})
	@ApiNotFoundResponse({
		description: 'Игра была не найдена, попробуйте другую'
	})
	public async getGameFromChessCom(@Param() dto: GameParamDto) {
		return this.gamesService.getGameFromChessCom(dto)
	}
}
