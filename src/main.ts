import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'
import { isDev } from './common/utils/is-dev-util'

process.on('unhandledRejection', reason => {
	console.error('[unhandledRejection]', reason)
})

process.on('uncaughtException', error => {
	console.error('[uncaughtException]', error)
})

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const config = app.get(ConfigService)

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true
		})
	)

	const allowedOrigins = isDev(config)
		? [
				config.getOrThrow<string>('FRONTEND_DEV_URL'),
				config.getOrThrow<string>('FRONTEND_URL')
			]
		: [config.getOrThrow<string>('FRONTEND_URL')]

	app.enableCors({
		origin: allowedOrigins
	})

	const docConfig = new DocumentBuilder()
		.setTitle('Chess Analyzer')
		.setDescription('Документация к API Backend сервиса')
		.setVersion('0.0.1')
		.addTag('Games')
		.build()

	const documentFactory = () => SwaggerModule.createDocument(app, docConfig)
	SwaggerModule.setup('api', app, documentFactory, {
		useGlobalPrefix: true
	})

	await await app.listen(process.env.PORT ?? 4000)
}
bootstrap()
