'use client'

import { Hand } from '@/app/play/[room]/components/GameBoard/components/Hand'
import { Tables } from '@/types/supabase'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect } from 'react'
import useGameContext from '../../hooks/useGameContext'
import { CardPiles } from './components/CardPiles'
import { Reroll } from './components/Reroll'
import { Side } from './components/Side'
import { Sidebar } from './components/Sidebar'
import { WaitForStartBanner } from './components/WaitForStartBanner'

type Props = {
	user: Pick<Tables<'profiles'>, 'id' | 'username'>
	roomId: string
}

export const GameBoard = ({ user, roomId }: Props) => {
	const { gameState, setTurn } = useGameContext()
	const supabase = createClientComponentClient()

	const host = gameState.players.find(p => p?.id === user.id)
	const opponent = gameState.players.find(p => p?.id !== user.id)

	const gameStarted = host?.gameStatus === 'play' && opponent?.gameStatus === 'play'

	useEffect(() => {
		const updateTurn = async () => {
			if (gameStarted && !gameState.turn) {
				const { data } = await supabase.from('rooms').select('turn').eq('id', roomId).single()

				const nonPassedPlayers = gameState.players.filter(p => p?.hasPassed === false)

				const startingPlayer =
					data?.turn ??
					(nonPassedPlayers.length === 2
						? nonPassedPlayers[Math.floor(Math.random() < 0.5 ? 0 : 1)]?.id
						: nonPassedPlayers[0]?.id)

				setTurn(startingPlayer)
			}
		}

		updateTurn()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [gameStarted])

	if (!host || !opponent) return null
	if (gameState.players.filter(p => p?.gameStatus === 'select-deck').length >= 1) return null

	return (
		<div className='grid grow grid-cols-[375px_1fr]'>
			{host.gameStatus === 'accepted' && <Reroll currentPlayer={host} />}
			{host.gameStatus === 'play' && opponent.gameStatus === 'accepted' && <WaitForStartBanner />}

			<Sidebar host={host} opponent={opponent} turn={gameState.turn} />

			<div className='flex h-full min-w-0 border-l bg-stone-600 pb-12 pl-24'>
				<div className='flex h-full min-w-0 grow flex-col'>
					<div className='grid h-full grid-rows-7 gap-y-2 bg-stone-600 pt-2'>
						<Side player={opponent} side='opponent' />
						<Side player={host} side='host' />

						<Hand player={host} />
					</div>
				</div>

				<div className='flex h-full min-w-max flex-col items-center justify-between gap-y-4 border-l bg-stone-800 pl-6 pr-4 pt-8'>
					<CardPiles player={opponent} side='opponent' />

					<div id='card-preview-container' className='relative flex w-full grow items-center justify-center'></div>

					<CardPiles player={host} side='host' />
				</div>
			</div>
		</div>
	)
}
