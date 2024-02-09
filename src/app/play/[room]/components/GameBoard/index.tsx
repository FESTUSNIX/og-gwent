'use client'

import { Hand } from '@/app/play/[room]/components/GameBoard/components/Hand'
import { BackgroundMusic } from '@/components/BackgroundMusic'
import { CardsPreview } from '@/components/CardsPreview'
import { WeatherEffect } from '@/types/WeatherEffect'
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
	const {
		gameState,
		sync,
		actions: { setTurn }
	} = useGameContext()
	const supabase = createClientComponentClient()

	const host = gameState.players.find(p => p?.id === user.id)
	const opponent = gameState.players.find(p => p?.id !== user.id)

	const gameStarted = host?.gameStatus === 'play' && opponent?.gameStatus === 'play'

	useEffect(() => {
		const updateTurn = async () => {
			const { data } = await supabase.from('rooms').select('turn').eq('id', roomId).single()

			const nonPassedPlayers = gameState.players.filter(p => p?.hasPassed === false)

			const startingPlayer =
				data?.turn ??
				(nonPassedPlayers.length === 2
					? nonPassedPlayers[Math.floor(Math.random() < 0.5 ? 0 : 1)]?.id
					: nonPassedPlayers[0]?.id)

			setTurn(startingPlayer)
			sync()
		}

		if (gameStarted && !gameState.turn && user.id === gameState.roomOwner) {
			updateTurn()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [gameStarted])

	if (!host || !opponent) return null
	if (gameState.players.filter(p => p?.gameStatus === 'select-deck').length >= 1) return null

	return (
		<main className='relative z-10 flex h-full w-full grow flex-col overflow-hidden bg-black'>
			<div className='relative mx-auto my-auto grid max-h-[980px] w-full max-w-[1780px] grow grid-cols-[375px_1fr]'>
				{host.gameStatus === 'accepted' && <Reroll currentPlayer={host} />}
				{host.gameStatus === 'play' && opponent.gameStatus === 'accepted' && <WaitForStartBanner />}

				<Sidebar
					host={host}
					opponent={opponent}
					turn={gameState.turn}
					weatherEffects={gameState.weatherEffects?.map(effect => effect.ability as WeatherEffect)}
				/>

				<div className='relative flex h-full min-w-0 bg-black pb-12 pl-28 pt-2 @container'>
					<div className='z-10 flex h-full min-w-0 grow flex-col'>
						<div className='relative flex h-full flex-col gap-y-2 pt-2'>
							<CardsPreview>
								<Side host={host} opponent={opponent} side='opponent' />

								<div className='pointer-events-none z-0 my-1.5 -ml-8 h-2 w-[calc(100%+2rem)] bg-[url("/game/board/rows_separator.png")] bg-center [background-size:100%_100%]' />

								<Side host={host} opponent={opponent} side='host' />
							</CardsPreview>

							<Hand player={host} />
						</div>
					</div>

					<div className='z-10 flex h-full min-w-max flex-col items-center justify-between gap-y-4 pl-6 pr-4 pt-8'>
						<CardPiles player={opponent} side='opponent' />

						<div id='card-preview-container' className='relative flex w-full grow items-center justify-center'></div>

						<CardPiles player={host} side='host' />
					</div>

					<div className='pointer-events-none absolute inset-0 z-0 h-full w-full bg-[url("/game/board/background.png")] bg-cover bg-left' />
				</div>

				<BackgroundMusic />

				<div className='pointer-events-none absolute left-0 top-0 z-0 h-full w-20 -translate-x-1/2 bg-gradient-to-r from-black from-50% to-black/0' />
				<div className='pointer-events-none absolute right-0 top-0 z-0 h-full w-20 translate-x-1/2 bg-gradient-to-l from-black from-50% to-black/0' />

				<div className='pointer-events-none absolute top-0 z-0 h-10 w-full -translate-y-1/2 bg-gradient-to-b from-black from-50% to-black/0' />
				<div className='pointer-events-none absolute bottom-0 z-0 h-10 w-full translate-y-1/2 bg-gradient-to-t from-black from-50% to-black/0' />
			</div>
		</main>
	)
}
