import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common'

import { ChesscomService } from './chesscom.service'

@Controller('search')
export class ChesscomController {
	constructor(private readonly chesscomService: ChesscomService) {}
	@Get(':username')
	@HttpCode(HttpStatus.OK)
	public async getGamesByUsername(@Param('username') username: string) {
		return this.chesscomService.getGamesByUsername(username)
	}
}
