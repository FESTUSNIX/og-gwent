'use client'

import { Hand } from '@/app/play/[room]/components/GameBoard/components/Hand'
import { getCurrentPlayerId } from '@/lib/getCurrentPlayerId'
import useGameContext from '../../hooks/useGameContext'
import { CardPiles } from './components/CardPiles'
import { Reroll } from './components/Reroll'
import { Side } from './components/Side'
import { Sidebar } from './components/Sidebar'
import { WaitForStartBanner } from './components/WaitForStartBanner'

type Props = {}

export const GameBoard = (props: Props) => {
	const { gameState } = useGameContext()

	const host = gameState.players.find(p => p.id === getCurrentPlayerId())
	const opponent = gameState.players.find(p => p.id !== getCurrentPlayerId())

	if (!host || !opponent) return null

	const gameAccepted = host.gameStatus !== 'select-deck' && opponent.gameStatus !== 'select-deck'
	const gameStarted = host.gameStatus === 'play' && opponent.gameStatus === 'play'
	const waitingForOpponent = host.gameStatus === 'play' && opponent.gameStatus !== 'play'

	if (!gameAccepted) return null

	return (
		<div className='grid grow grid-cols-[375px_1fr]'>
			{gameAccepted && !waitingForOpponent && !gameStarted && <Reroll currentPlayer={host} />}
			{waitingForOpponent && <WaitForStartBanner />}

			<Sidebar host={host} opponent={opponent} />

			<div className='flex h-full min-w-0 border-l bg-stone-600 pb-12 pl-12'>
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
