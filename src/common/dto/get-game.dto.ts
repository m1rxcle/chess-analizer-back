import { ApiProperty } from '@nestjs/swagger'

class GameAccuraciesDto {
	@ApiProperty({
		description: 'Точность игры белых',
		example: 91.42
	})
	white!: number

	@ApiProperty({
		description: 'Точность игры чёрных',
		example: 87.65
	})
	black!: number
}

class GamePlayerDto {
	@ApiProperty({
		description: 'Уникальный идентификатор игрока на Chess.com',
		example: '12345678'
	})
	id!: string

	@ApiProperty({
		description: 'Рейтинг игрока',
		example: 1450
	})
	rating!: number

	@ApiProperty({
		description: 'Результат игрока в партии',
		example: 'win'
	})
	result!: string

	@ApiProperty({
		description: 'Имя пользователя на Chess.com',
		example: 'GothamChess'
	})
	username!: string
}

export class GetGameResponseDto {
	@ApiProperty({
		description: 'Уникальный идентификатор партии',
		example: '1fdd8410-af63-11f1-bbdf-8eeeee01000f'
	})
	uuid!: string

	@ApiProperty({
		description: 'Ссылка на партию на Chess.com',
		example: 'https://www.chess.com/game/live/123456789'
	})
	url!: string

	@ApiProperty({
		description: 'PGN партии',
		example: '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6'
	})
	pgn!: string

	@ApiProperty({
		description: 'Контроль времени партии',
		example: '600+5'
	})
	time_control!: string

	@ApiProperty({
		description: 'Время окончания партии в Unix timestamp',
		example: '1758451200'
	})
	end_time!: string

	@ApiProperty({
		description: 'Является ли партия рейтинговой',
		example: true
	})
	rated!: boolean

	@ApiProperty({
		description: 'Точность игры каждого игрока',
		type: GameAccuraciesDto
	})
	accuracies!: GameAccuraciesDto

	@ApiProperty({
		description: 'TCN-код партии',
		example: 'm1rxcle_n...'
	})
	tcn!: string

	@ApiProperty({
		description: 'Начальная позиция партии',
		example: ''
	})
	initial_setup!: string

	@ApiProperty({
		description: 'FEN начальной позиции',
		example: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
	})
	fen!: string

	@ApiProperty({
		description: 'Класс контроля времени',
		example: 'blitz'
	})
	time_class!: string

	@ApiProperty({
		description: 'Правила игры',
		example: 'chess'
	})
	rules!: string

	@ApiProperty({
		description: 'Информация о белых',
		type: GamePlayerDto
	})
	white!: GamePlayerDto

	@ApiProperty({
		description: 'Информация о чёрных',
		type: GamePlayerDto
	})
	black!: GamePlayerDto

	@ApiProperty({
		description: 'Код дебюта ECO',
		example: 'C20'
	})
	eco!: string
}
