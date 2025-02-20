'use client'

import useGameContext from '@/app/play/[room]/hooks/useGameContext'
import { Button } from '@/components/ui/button'
import { getVw } from '@/lib/utils'
import { GamePlayer } from '@/types/Game'

type Props = {
	player: GamePlayer
	opponent: GamePlayer
}

export const PassButton = ({ player, opponent }: Props) => {
	const {
		sync,
		actions: { setTurn, updatePlayerState }
	} = useGameContext()

	const handlePass = () => {
		updatePlayerState(player.id, {
			hasPassed: true
		})

		!opponent.hasPassed && setTurn(opponent.id)

		sync()
	}

	return (
		<div className=''>
			<Button
				variant={'default'}
				size={'sm'}
				onClick={() => {
					handlePass()
				}}
				className='h-auto px-[3%] py-[2%] leading-tight hover:bg-primary/80'
				style={{ fontSize: getVw(14), padding: `${getVw(8)} ${getVw(12)}` }}>
				Pass the round
			</Button>
		</div>
	)
}
