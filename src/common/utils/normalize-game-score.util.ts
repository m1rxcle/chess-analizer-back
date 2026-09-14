export function normalizeGameScore(score: number) {
	return Math.max(-4, Math.min(4, score))
}
