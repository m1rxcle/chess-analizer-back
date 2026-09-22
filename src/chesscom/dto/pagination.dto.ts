import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min } from 'class-validator'

export class PaginationDto {
	@ApiProperty({
		description: 'Условный номер странницы для виртуализации',
		type: Number
	})
	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page: number = 1
	@ApiProperty({
		description: 'Лимит для отображения партий',
		type: Number
	})
	@ApiPropertyOptional()
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit: number = 50
}
