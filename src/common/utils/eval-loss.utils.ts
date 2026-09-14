export function evalLoss(
	playerColor: 'white' | 'black',
	whiteScoreBefore: number,
	whiteScoreAfter: number
) {
	const loss =
		playerColor === 'white'
			? whiteScoreBefore - whiteScoreAfter
			: whiteScoreAfter - whiteScoreBefore

	return +Math.max(0, loss).toFixed(2)
}
