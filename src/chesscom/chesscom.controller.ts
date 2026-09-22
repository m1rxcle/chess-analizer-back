import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Query
} from '@nestjs/common'
import {
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiParam,
	ApiQuery
} from '@nestjs/swagger'

import { ChesscomService } from './chesscom.service'
import { PaginateGamesResponse } from './dto/paginate-game-response.dto'
import { PaginationDto } from './dto/pagination.dto'
import { TPaginateGames } from './types/paginate-games'

@Controller('search')
export class ChesscomController {
	constructor(private readonly chesscomService: ChesscomService) {}
	@Get(':username')
	@HttpCode(HttpStatus.OK)
	@ApiParam({
		name: 'username',
		type: String,
		description: 'Имя игрока с chess.com'
	})
	@ApiQuery(PaginationDto)
	@ApiOkResponse({
		type: PaginateGamesResponse
	})
	@ApiNotFoundResponse({
		description: 'Пользователь не найден'
	})
	public async getGamesByUsername(
		@Param('username') username: string,
		@Query() paginationDto: PaginationDto
	): Promise<TPaginateGames> {
		return this.chesscomService.getGamesByUsername(
			username,
			paginationDto.page,
			paginationDto.limit
		)
	}
}
