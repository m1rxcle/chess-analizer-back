export function getWhitePerspectiveScore(
	score: number,
	sideToMove: 'white' | 'black'
) {
	return sideToMove === 'white' ? score : -score
}
