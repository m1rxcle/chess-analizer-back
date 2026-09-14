import { IsNotEmpty, IsString } from 'class-validator'

export class GameParamDto {
	@IsString({ message: 'userId должен быть строкой' })
	@IsNotEmpty({ message: 'userId не должен быть пустым' })
	gameId!: string
	@IsString({ message: 'username должен быть строкой' })
	@IsNotEmpty({ message: 'username не должен быть пустым' })
	username!: string
}
