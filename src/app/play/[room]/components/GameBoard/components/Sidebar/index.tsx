import { GamePlayer } from '@/types/Game'
import { WeatherEffect } from '@/types/WeatherEffect'
import { GiveUpButton } from '../GiveUpButton'
import { PassButton } from './components/PassButton'
import { PlayerStats } from './components/PlayerStats'
import { WeatherCardSlots } from './components/WeatherCardSlots'

type Props = {
	opponent: GamePlayer
	host: GamePlayer
	turn: GamePlayer['id'] | null
	weatherEffects: WeatherEffect[] | undefined
}

export const Sidebar = ({ host, opponent, turn, weatherEffects }: Props) => {
	return (
		<div className='relative flex flex-col justify-between pb-12 pt-8'>
			<PlayerStats player={opponent} opponent={host} side='opponent' turn={turn} weatherEffects={weatherEffects} />

			<div className='my-6 ml-12 mr-6 flex grow flex-col items-center justify-center gap-6'>
				<WeatherCardSlots host={host} opponent={opponent} />

				{turn === host.id && <PassButton player={host} opponent={opponent} />}
			</div>

			<PlayerStats player={host} opponent={opponent} side='host' turn={turn} weatherEffects={weatherEffects} />

			<div className="absolute inset-0 -z-30 bg-[url('/game/board/sidebar.png')] bg-cover bg-right" />

			<GiveUpButton playerId={host.id} />
		</div>
	)
}
