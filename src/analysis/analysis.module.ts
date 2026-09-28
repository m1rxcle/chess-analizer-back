import { Module } from '@nestjs/common'

import { GamesModule } from '../games/games.module'
import { StockfishModule } from '../stockfish/stockfish.module'

import { AnalysisController } from './analysis.controller'
import { AnalysisService } from './analysis.service'

@Module({
	imports: [GamesModule, StockfishModule],
	controllers: [AnalysisController],
	providers: [AnalysisService]
})
export class AnalysisModule {}
