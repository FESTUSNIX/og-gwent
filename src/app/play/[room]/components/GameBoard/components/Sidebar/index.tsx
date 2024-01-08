import { GamePlayer } from '@/types/Game'
import { PassButton } from './components/PassButton'
import { PlayerStats } from './components/PlayerStats'
import { WeatherCardSlots } from './components/WeatherCardSlots'

type Props = {
	opponent: GamePlayer
	host: GamePlayer
	turn: GamePlayer['id'] | null
}

export const Sidebar = ({ host, opponent, turn }: Props) => {
	return (
		<div className='relative flex flex-col justify-between pb-12 pt-8'>
			<PlayerStats player={opponent} opponent={host} side='opponent' turn={turn} />

			<div className='ml-12 mr-6 flex flex-col items-center gap-4'>
				<WeatherCardSlots />

				{turn === host.id && <PassButton player={host} opponent={opponent} />}
			</div>

			<PlayerStats player={host} opponent={opponent} side='host' turn={turn} />
		</div>
	)
}
