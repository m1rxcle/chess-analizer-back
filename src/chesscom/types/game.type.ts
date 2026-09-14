export type TGame = {
	uuid: string
	url: string
	pgn: string
	time_control: string
	end_time: string
	rated: boolean
	accuracies: {
		white: number
		black: number
	}
	tcn: string
	initial_setup: string
	fen: string
	time_class: string
	rules: string
	white: {
		id: string
		rating: number
		result: string
		username: string
	}
	black: {
		id: string
		rating: number
		result: string
		username: string
	}
	eco: string
}
