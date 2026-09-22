import { ApiProperty } from '@nestjs/swagger'

import { GetGameResponseDto } from '../../common/dto/get-game.dto'
import { TGame } from '../types/game.type'

export class PaginateGamesResponse {
	@ApiProperty({
		type: GetGameResponseDto
	})
	games!: TGame[]
	@ApiProperty({
		type: Number,
		description: 'Странницы для пагинации'
	})
	page!: number
	@ApiProperty({
		type: Number,
		description: 'Количество отображаемых игр'
	})
	limit!: number
	@ApiProperty({
		type: Number,
		description: 'Есть ли следующие странницы'
	})
	hasNextPage!: boolean
	@ApiProperty({
		type: Number,
		description: 'Всего игр пользователя'
	})
	totalGames!: number
}
