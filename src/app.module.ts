import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AnalysisModule } from './analysis/analysis.module'
import { ChesscomModule } from './chesscom/chesscom.module'
import { GamesModule } from './games/games.module'
import { ObserveModule } from './observe.module'
import { StockfishModule } from './stockfish/stockfish.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		GamesModule,
		ChesscomModule,
		StockfishModule,
		AnalysisModule,
		ObserveModule.forRoot({
			appKey: process.env.OBSERVE_API_KEY!,
			appSecret: process.env.OBSERVE_SECRET_KEY!,
			serviceId: 'Chess-analyze-app'
		})
	],
	controllers: [],
	providers: []
})
export class AppModule {}
