'use client'

import { Card } from '@/components/Card'
import { getRandomEntries } from '@/lib/utils'
import { Card as CardType } from '@/types/Card'
import { GamePlayer } from '@/types/Game'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import useGameContext from '../../../hooks/useGameContext'

type Props = {
	host: GamePlayer
	opponent: GamePlayer
}

const startingHandSize = 10
const maxRerolls = 2

export const Reroll = ({ host, opponent }: Props) => {
	const {
		sync,
		actions: { addToContainer, removeFromContainer, setPlayerGameStatus }
	} = useGameContext()

	const [hand, setHand] = useState<CardType[]>([])
	const [rerolls, setRerolls] = useState(0)

	useEffect(() => {
		if (host.gameStatus === 'accepted' && host && host.hand.length === 0) {
			const deck = host.deck

			let newHand: CardType[] = hand

			while (newHand.length < startingHandSize) {
				const randomIndex = Math.floor(Math.random() * deck.length)

				const newCard = deck[randomIndex]

				if (newHand.includes(newCard)) continue

				newHand.push(newCard)
			}

			addToContainer(host.id, newHand, 'hand')
			removeFromContainer(host.id, newHand, 'deck')
			setHand(newHand)

			sync()
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [host.gameStatus, opponent.gameStatus])

	function reroll(card: CardType) {
		if (rerolls >= maxRerolls) return

		const newCard = getRandomEntries(host?.deck || [], 1)[0]
		if (!newCard) return

		const cardToChange = hand.indexOf(card)

		const newHand = hand
		newHand[cardToChange] = newCard

		addToContainer(host?.id, newHand, 'hand', true)

		removeFromContainer(host?.id, [newCard], 'deck')
		addToContainer(host?.id, [card], 'deck')

		setHand(newHand)
		setRerolls(prevRerolls => prevRerolls + 1)

		sync()
	}

	useEffect(() => {
		if (rerolls === maxRerolls) {
			setTimeout(() => {
				setPlayerGameStatus(host.id, 'play')
				sync()
			}, 0)
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rerolls])

	if (!host) return null

	return (
		<div className='fixed inset-0 z-50 flex h-full w-full items-center justify-center bg-black/50'>
			<div className='flex w-full flex-col items-center'>
				<div className='w-full bg-black py-2.5 text-center'>
					<p className='text-2xl text-primary'>
						<span>Choose cards to reroll. </span>
						<span>
							{rerolls}/{maxRerolls}
						</span>
					</p>
				</div>

				<div className='w-full py-6'>
					<div className='mx-auto grid max-w-screen-xl grid-cols-5 gap-8 px-16'>
						{hand.map((card, i) => (
							<button key={i} onClick={() => reroll(card)}>
								<Card card={card} mode='preview' />
							</button>
						))}
					</div>
				</div>

				<button
					onClick={() => {
						setPlayerGameStatus(host.id, 'play')
						sync()
					}}
					className='fixed right-4 top-4 flex items-center gap-2 bg-secondary px-2 py-0.5'>
					<span className='text-sm'>Start game</span>
					<ArrowRight className='h-4 w-4' />
				</button>
			</div>
		</div>
	)
}
