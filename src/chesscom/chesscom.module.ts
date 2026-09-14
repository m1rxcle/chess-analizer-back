import { Module } from '@nestjs/common'

import { ChesscomController } from './chesscom.controller'
import { ChesscomService } from './chesscom.service'

@Module({
	controllers: [ChesscomController],
	providers: [ChesscomService],
	exports: [ChesscomService]
})
export class ChesscomModule {}
