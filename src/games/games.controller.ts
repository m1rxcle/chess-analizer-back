import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common'
import { GameParamDto } from 'src/common/dto/game-param.dto'

import { GamesService } from './games.service'

@Controller('games')
export class GamesController {
	constructor(private readonly gamesService: GamesService) {}

	@Get(':username/:gameId')
	@HttpCode(HttpStatus.OK)
	public async getGameFromChessCom(@Param() dto: GameParamDto) {
		return this.gamesService.getGameFromChessCom(dto)
	}
}
