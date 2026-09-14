import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Query
} from '@nestjs/common'
import { GameParamDto } from 'src/common/dto/game-param.dto'

import { StockfishService } from './stockfish.service'

@Controller()
export class StockfishController {
	constructor(private readonly stockfishService: StockfishService) {}

	@Get('/:username/:gameId/analyze')
	@HttpCode(HttpStatus.OK)
	public async stockfishAnalysis(
		@Param() dto: GameParamDto,
		@Query('move') move: number = 0
	) {
		const analysis = await this.stockfishService.stockfishAnalysis(
			dto,
			move
		)

		return analysis
	}
}
