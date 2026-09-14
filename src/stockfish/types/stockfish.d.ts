declare module 'stockfish' {
	type StockfishEngine = {
		sendCommand(command: string): void
		listener?: (message: string) => void
		terminate?: () => void
	}

	function stockfish(enginePath?: string): Promise<StockfishEngine>

	export default stockfish
}
