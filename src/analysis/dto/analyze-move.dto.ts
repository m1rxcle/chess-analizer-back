import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class AnalyzeMoveDto {
	@ApiProperty({
		description: 'Номер хода в партии',
		example: 12
	})
	move!: number

	@ApiProperty({
		description: 'Цвет игрока, который совершил ход',
		enum: ['white', 'black'],
		example: 'white'
	})
	color!: 'white' | 'black'

	@ApiProperty({
		description: 'Ход, который был сыгран игроком',
		example: 'e2e4'
	})
	playerMove!: string

	@ApiProperty({
		description: 'Лучший ход по версии Stockfish',
		example: 'e2e4'
	})
	bestMove!: string

	@ApiProperty({
		description: 'Оценка позиции до хода с точки зрения белых',
		example: 0.35
	})
	whiteScoreBefore!: number

	@ApiProperty({
		description: 'Оценка позиции после хода с точки зрения белых',
		example: 0.42
	})
	whiteScoreAfter!: number

	@ApiProperty({
		description: 'Оценка позиции до хода с точки зрения чёрных',
		example: -0.35
	})
	blackScoreBefore!: number

	@ApiProperty({
		description: 'Оценка позиции после хода с точки зрения чёрных',
		example: -0.42
	})
	blackScoreAfter!: number

	@ApiProperty({
		description:
			'Оценка позиции до хода с точки зрения игрока, который ходит',
		example: 0.35
	})
	gameScoreBefore!: number

	@ApiProperty({
		description:
			'Оценка позиции после хода с точки зрения игрока, который ходит',
		example: 0.42
	})
	gameScoreAfter!: number

	@ApiPropertyOptional({
		description: 'Количество ходов до мата, если Stockfish обнаружил мат',
		example: 3,
		nullable: true
	})
	mate?: number | null

	@ApiProperty({
		description: 'Потеря оценки позиции в результате хода',
		example: 0.07
	})
	evalLoss!: number

	@ApiProperty({
		description: 'Оценка качества хода',
		example: 'Хороший ход'
	})
	quality!: string

	@ApiProperty({
		description: 'Является ли сыгранный ход лучшим ходом Stockfish',
		example: true
	})
	isBestMove!: boolean
}
