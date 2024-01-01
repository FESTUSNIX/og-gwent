import { ROW_TYPES } from '@/constants/ROW_TYPES'
import { GamePlayer } from '@/types/Game'
import { Row } from './Row'

type Props = {
	player: GamePlayer
	side: 'host' | 'opponent'
}

export const Side = ({ player, side }: Props) => {
	return (
		<>
			{ROW_TYPES.map((rowType, i) => (
				<Row
					key={rowType}
					rowType={rowType}
					player={player}
					side={side}
					style={{ order: side === 'opponent' ? -i : i }}
				/>
			))}
		</>
	)
}
