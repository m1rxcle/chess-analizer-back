import { Injectable } from '@nestjs/common'
import { ChesscomService } from 'src/chesscom/chesscom.service'
import type { GameParamDto } from 'src/common/dto/game-param.dto'

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
