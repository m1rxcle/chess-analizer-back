import { getWhitePerspectiveScore } from './get-white-perspective-score.utils'

const MATE_SCORE = 100

export function getWhitePerspectiveEvaluation(
	score: number,
	mate: number | undefined,
	sideToMove: 'white' | 'black'
) {
	if (mate !== undefined) {
		const sideScore = mate > 0 ? MATE_SCORE : -MATE_SCORE

		return sideToMove === 'white' ? sideScore : -sideScore
	}

	return getWhitePerspectiveScore(score, sideToMove)
}
