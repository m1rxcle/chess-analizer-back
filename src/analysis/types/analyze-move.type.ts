export type TAnalyzeMove = {
	move: number
	color: 'white' | 'black'
	playerMove: string
	bestMove: string
	whiteScoreBefore: number
	whiteScoreAfter: number
	blackScoreBefore: number
	blackScoreAfter: number
	gameScoreBefore: number
	gameScoreAfter: number
	mate?: number | null
	evalLoss: number
	quality: string
	isBestMove: boolean
}
