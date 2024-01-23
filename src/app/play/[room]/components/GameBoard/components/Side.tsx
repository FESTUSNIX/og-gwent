import { GamePlayer } from '@/types/Game'
import { Row } from './Row'

type Props = {
	player: GamePlayer
	side: 'host' | 'opponent'
}

export const Side = ({ player, side }: Props) => {
	return (
		<>
			{['melee', 'range', 'siege'].map((rowType, i) => (
				<Row
					key={rowType}
					rowType={rowType as 'melee' | 'range' | 'siege'}
					player={player}
					side={side}
					style={{ order: side === 'opponent' ? -i : i }}
				/>
			))}
		</>
	)
}
