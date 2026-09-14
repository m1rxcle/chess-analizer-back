import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AnalysisModule } from './analysis/analysis.module'
import { ChesscomModule } from './chesscom/chesscom.module'
import { GamesModule } from './games/games.module'
import { StockfishModule } from './stockfish/stockfish.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		GamesModule,
		ChesscomModule,
		StockfishModule,
		AnalysisModule
	],
	controllers: [],
	providers: []
})
export class AppModule {}
