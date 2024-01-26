import { GamePlayer } from '@/types/Game'
import { Row } from './Row'
import { BoardRowTypes } from '@/types/RowType'

type Props = {
	host: GamePlayer
	opponent: GamePlayer
	side: 'host' | 'opponent'
}

export const Side = ({ host, opponent, side }: Props) => {
	return (
		<>
			{['melee', 'range', 'siege'].map((rowType, i) => (
				<Row
					key={rowType}
					rowType={rowType as BoardRowTypes}
					host={host}
					opponent={opponent}
					side={side}
					style={{ order: side === 'opponent' ? -i : i }}
				/>
			))}
		</>
	)
}
