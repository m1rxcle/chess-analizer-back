import { Injectable } from '@nestjs/common'

import { ChesscomService } from '../chesscom/chesscom.service'
import type { GameParamDto } from '../common/dto/game-param.dto'

@Injectable()
export class GamesService {
	public constructor(private readonly chesscomService: ChesscomService) {}

	public async getGameFromChessCom(dto: GameParamDto) {
		return this.chesscomService.getGameByUsernameAndId(
			dto.username,
			dto.gameId
		)
	}
}
