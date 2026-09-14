import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Query
} from '@nestjs/common'

import { ChesscomService } from './chesscom.service'
import { PaginationDto } from './dto/pagination.dto'

@Controller('search')
export class ChesscomController {
	constructor(private readonly chesscomService: ChesscomService) {}
	@Get(':username')
	@HttpCode(HttpStatus.OK)
	public async getGamesByUsername(
		@Param('username') username: string,
		@Query() paginationDto: PaginationDto
	) {
		return this.chesscomService.getGamesByUsername(
			username,
			paginationDto.page,
			paginationDto.limit
		)
	}
}
