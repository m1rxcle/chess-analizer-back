import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class StockfishAnalysisDto {
	@ApiProperty({
		description: 'Лучший ход, предложенный Stockfish',
		example: 'e2e4'
	})
	bestMove!: string

	@ApiProperty({
		description: 'Глубина анализа позиции после хода',
		example: 16
	})
	depthAfter!: number

	@ApiProperty({
		description: 'Глубина анализа позиции до хода',
		example: 16
	})
	depthBefore!: number

	@ApiProperty({
		description: 'Номер анализируемого хода',
		example: 1
	})
	move!: number

	@ApiProperty({
		description: 'Ход, который был сыгран игроком',
		example: 'e2e4'
	})
	playerMove!: string

	@ApiProperty({
		description:
			'Основная линия продолжения после хода (Principal Variation)',
		type: [String],
		example: ['e7e5', 'g1f3', 'b8c6']
	})
	pvAfter!: string[]

	@ApiProperty({
		description: 'Основная линия продолжения до хода (Principal Variation)',
		type: [String],
		example: ['e7e5', 'g1f3', 'b8c6']
	})
	pvBefore!: string[]

	@ApiProperty({
		description: 'Оценка позиции после хода в пешках',
		example: -0.44
	})
	scoreAfter!: number

	@ApiProperty({
		description: 'Оценка позиции до хода в пешках',
		example: 0.37
	})
	scoreBefore!: number

	@ApiProperty({
		description: 'Оценка качества хода',
		example: 'Лучший ход'
	})
	quality!: string

	@ApiProperty({
		description: 'Лучший ответ соперника после сыгранного хода',
		example: 'e7e5'
	})
	responseMove!: string

	@ApiPropertyOptional({
		description: 'Количество ходов до матовой позиции после хода',
		example: 3
	})
	mateAfter?: number

	@ApiPropertyOptional({
		description: 'Количество ходов до матовой позиции до хода',
		example: 5
	})
	mateBefore?: number
}
