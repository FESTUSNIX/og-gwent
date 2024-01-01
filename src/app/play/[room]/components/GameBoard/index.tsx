'use client'

import { Hand } from '@/app/play/[room]/components/GameBoard/components/Hand'
import useGameContext from '../../hooks/useGameContext'
import { CardPiles } from './components/CardPiles'
import { Reroll } from './components/Reroll'
import { Side } from './components/Side'
import { Sidebar } from './components/Sidebar'
import { WaitForStartBanner } from './components/WaitForStartBanner'

type Props = {}

export const GameBoard = (props: Props) => {
	const { gameState } = useGameContext()

	const host = gameState.players.find(p => p.id === 0)
	const opponent = gameState.players.find(p => p.id === 1)

	if (!host || !opponent)
		return (
			<div>
				<h1>Game not found</h1>
				<p>Please make sure you have entered the correct room code.</p>
			</div>
		)

	const gameAccepted = host.gameStatus !== 'select-deck' && opponent.gameStatus !== 'select-deck'
	const gameStarted = host.gameStatus === 'play' && opponent.gameStatus === 'play'
	const waitingForOpponent = host.gameStatus === 'play' && opponent.gameStatus !== 'play'

	if (!gameAccepted) return null

	return (
		<div className='grid grow grid-cols-[375px_1fr]'>
			{gameAccepted && !waitingForOpponent && !gameStarted && <Reroll currentPlayer={host} />}
			{waitingForOpponent && <WaitForStartBanner />}

			<Sidebar host={host} opponent={opponent} />

			<div className='flex h-full min-w-0 border-l bg-stone-600 pb-16 pl-12'>
				<div className='flex h-full min-w-0 grow flex-col'>
					<div className='grid h-full grid-rows-2 gap-y-6 bg-stone-600 py-2'>
						<Side player={opponent} side='opponent' />
						<Side player={host} side='host' />
					</div>

					<Hand player={host} />
				</div>

				<div className='flex h-full min-w-max flex-col items-center justify-between border-l bg-stone-800 px-4 pt-8'>
					<CardPiles player={opponent} side='opponent' />
					<CardPiles player={host} side='host' />
				</div>
			</div>
		</div>
	)
}
