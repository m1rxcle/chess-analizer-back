export function assessmentOfMovementQuality(
	evalLoss: number,
	isBestMove: boolean
) {
	let quality = ''

	if (isBestMove) {
		quality = 'Лучший ход'
	} else if (evalLoss <= 0.05 && !isBestMove) {
		quality = 'Хороший ход'
	} else if (evalLoss > 0.05 && evalLoss <= 0.2) {
		quality = 'Хороший ход'
	} else if (evalLoss > 0.2 && evalLoss <= 0.5) {
		quality = 'Неточный ход'
	} else if (evalLoss > 0.5 && evalLoss <= 1) {
		quality = 'Ошибка'
	} else if (evalLoss > 1) {
		quality = 'Зевок'
	}

	return quality
}
