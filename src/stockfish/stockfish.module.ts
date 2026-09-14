import { Module } from '@nestjs/common'
import { ChesscomModule } from 'src/chesscom/chesscom.module'
import { GamesModule } from 'src/games/games.module'

import { StockfishController } from './stockfish.controller'
import { StockfishService } from './stockfish.service'

@Module({
	imports: [GamesModule, ChesscomModule],
	controllers: [StockfishController],
	providers: [StockfishService],
	exports: [StockfishService]
})
export class StockfishModule {}
