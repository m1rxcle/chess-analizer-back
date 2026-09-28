import { Module } from '@nestjs/common'

import { ChesscomModule } from '../chesscom/chesscom.module'

import { GamesController } from './games.controller'
import { GamesService } from './games.service'

@Module({
	imports: [ChesscomModule],
	controllers: [GamesController],
	providers: [GamesService],
	exports: [GamesService]
})
export class GamesModule {}
