export type TStockfishAnalysisResponse = {
	bestMove: string
	depthAfter: number
	depthBefore: number
	move: number
	playerMove: string
	pvAfter: string[]
	pvBefore: string[]
	scoreAfter: number
	scoreBefore: number
	quality: string
	responseMove: string
	mateAfter?: number
	mateBefore?: number
}
