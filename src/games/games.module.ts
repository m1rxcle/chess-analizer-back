import { Module } from '@nestjs/common'
import { ChesscomService } from 'src/chesscom/chesscom.service'

import { GamesController } from './games.controller'
import { GamesService } from './games.service'

@Module({
	controllers: [GamesController],
	providers: [GamesService, ChesscomService],
	exports: [GamesService]
})
export class GamesModule {}
