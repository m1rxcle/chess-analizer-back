export type TParsedMove = {
	moveNumber: number
	color: 'white' | 'black'
	san: string
	uci: string
	fenBefore: string
	fenAfter: string
}
