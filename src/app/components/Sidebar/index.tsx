import { Player } from '@/types/Player'
import { PlayerStats } from './components/PlayerStats'
import { WeatherCardSlots } from './components/WeatherCardSlots'

type Props = {
	opponent: Player
	host: Player
}

export const Sidebar = ({ host, opponent }: Props) => {
	return (
		<div className='relative flex flex-col justify-between pb-16 pt-8'>
			<PlayerStats player={opponent} side='opponent' />

			<WeatherCardSlots />

			<PlayerStats player={host} side='host' />
		</div>
	)
}
