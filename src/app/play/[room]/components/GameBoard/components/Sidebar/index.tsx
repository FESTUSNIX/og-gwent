import { GamePlayer } from '@/types/Game'
import { PlayerStats } from './components/PlayerStats'
import { WeatherCardSlots } from './components/WeatherCardSlots'

type Props = {
	opponent: GamePlayer
	host: GamePlayer
}

export const Sidebar = ({ host, opponent }: Props) => {
	return (
		<div className='relative flex flex-col justify-between pb-12 pt-8'>
			<PlayerStats player={opponent} side='opponent' />

			<WeatherCardSlots />

			<PlayerStats player={host} side='host' />
		</div>
	)
}
