import { GamePlayer } from '@/types/Game'
import { WeatherEffect } from '@/types/WeatherEffect'
import { GiveUpButton } from '../GiveUpButton'
import { PassButton } from './components/PassButton'
import { PlayerStats } from './components/PlayerStats'
import { WeatherCardSlots } from './components/WeatherCardSlots'
import { getVw } from '@/lib/utils'

type Props = {
	opponent: GamePlayer
	host: GamePlayer
	turn: GamePlayer['id'] | null
	weatherEffects: WeatherEffect[] | undefined
}

export const Sidebar = ({ host, opponent, turn, weatherEffects }: Props) => {
	return (
		<div className='relative flex min-h-0 flex-col justify-between pb-[4%] pt-[5%]'>
			<PlayerStats player={opponent} opponent={host} side='opponent' turn={turn} weatherEffects={weatherEffects} />

			<div className='my-[6%] ml-[12%] mr-[6%] flex grow items-center justify-center'>
				<WeatherCardSlots host={host} opponent={opponent} />
			</div>

			<PlayerStats player={host} opponent={opponent} side='host' turn={turn} weatherEffects={weatherEffects} />

			<div className="absolute inset-0 -z-30 bg-[url('/game/board/sidebar.png')] bg-cover bg-right" />

			<div className='absolute bottom-[3%] right-[3%] flex flex-col items-end' style={{ gap: getVw(24) }}>
				{turn === host.id && <PassButton player={host} opponent={opponent} />}
				<GiveUpButton playerId={host.id} />
			</div>
		</div>
	)
}
