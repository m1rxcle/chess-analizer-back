import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Query
} from '@nestjs/common'
import {
	ApiInternalServerErrorResponse,
	ApiOkResponse,
	ApiParam,
	ApiQuery
} from '@nestjs/swagger'

import { GameParamDto } from '../common/dto/game-param.dto'

import { StockfishAnalysisDto } from './dto/stockfish-analysis-response.dto'
import { StockfishService } from './stockfish.service'
import { TStockfishAnalysisResponse } from './types/stockfish-analysis-response.type'

@Controller()
export class StockfishController {
	constructor(private readonly stockfishService: StockfishService) {}

	@Get('/:username/:gameId/analyze')
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
	@ApiQuery({
		name: 'move',
		description: 'Номер хода',
		type: Number,
		example: '1',
		required: false
	})
	@ApiOkResponse({
		type: StockfishAnalysisDto,
		description: 'Сервис вернет данные без сообщения'
	})
	@ApiInternalServerErrorResponse({
		description: 'Не удалось запустить движок'
	})
	public async stockfishAnalysis(
		@Param() dto: GameParamDto,
		@Query('move') move: number = 0
	): Promise<TStockfishAnalysisResponse> {
		const analysis = await this.stockfishService.stockfishAnalysis(
			dto,
			move
		)

		return analysis
	}
}
