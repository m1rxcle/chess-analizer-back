import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common'
import {
	ApiInternalServerErrorResponse,
	ApiOkResponse,
	ApiParam
} from '@nestjs/swagger'
import { GameParamDto } from 'src/common/dto/game-param.dto'

import { AnalysisService } from './analysis.service'
import { AnalyzeMoveDto } from './dto/analyze-move.dto'
import { TAnalyzeMove } from './types/analyze-move.type'

@Controller('analysis')
export class AnalysisController {
	constructor(private readonly analysisService: AnalysisService) {}

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
		type: AnalyzeMoveDto,
		description: 'Сервис вернет данные без сообщения'
	})
	@ApiInternalServerErrorResponse({
		description: 'Ошибка анализа партии, пожалуйста попробуйте позже...'
	})
	public async analyzeMoves(
		@Param() dto: GameParamDto
	): Promise<TAnalyzeMove[]> {
		return await this.analysisService.analyzeMoves(dto)
	}
}
