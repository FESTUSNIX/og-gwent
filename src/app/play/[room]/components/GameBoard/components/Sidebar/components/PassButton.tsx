'use client'

import useGameContext from '@/app/play/[room]/hooks/useGameContext'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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
		<div className='flex w-full items-center gap-2'>
			<Separator className='w-auto grow bg-primary/25' />
			<Button
				variant={'secondary'}
				size={'sm'}
				onClick={() => {
					handlePass()
				}}>
				Pass the round
			</Button>
			<Separator className='w-auto grow bg-primary/25' />
		</div>
	)
}
