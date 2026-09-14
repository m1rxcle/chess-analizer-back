import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common'
import { GameParamDto } from 'src/common/dto/game-param.dto'

import { AnalysisService } from './analysis.service'

@Controller('analysis')
export class AnalysisController {
	constructor(private readonly analysisService: AnalysisService) {}

	@Get(':username/:gameId')
	@HttpCode(HttpStatus.OK)
	public async analyzeMoves(@Param() dto: GameParamDto) {
		return await this.analysisService.analyzeMoves(dto)
	}
}
