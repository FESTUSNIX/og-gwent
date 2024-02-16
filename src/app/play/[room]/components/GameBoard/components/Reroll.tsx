'use client'

import { CardsCarousel } from '@/components/CardsPreview'
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog'
import { cn, getRandomEntries } from '@/lib/utils'
import { Card as CardType } from '@/types/Card'
import { GamePlayer } from '@/types/Game'
import { DialogContent } from '@radix-ui/react-dialog'
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

	function reroll(card: CardType) {
		if (rerolls >= maxRerolls || host.gameStatus === 'play') return

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
		<Dialog open={true}>
			<DialogPortal>
				<DialogOverlay className='bg-black/60' />
				<DialogContent className='z-50 max-w-full'>
					<div
						className={cn(
							'fixed left-[50%] top-[47.5%] z-50 flex w-full max-w-full translate-x-[-50%] translate-y-[-50%] flex-col items-center justify-center border-none'
						)}>
						<div className='mb-12 w-full bg-black/80 py-2.5 text-center'>
							<p className='text-2xl text-primary'>
								<span>Choose cards to reroll. </span>
								<span>
									{rerolls}/{maxRerolls}
								</span>
							</p>
						</div>
						<div className='w-[80vw]'>
							<CardsCarousel
								index={0}
								cards={hand}
								onCardSelect={reroll}
								slidesToShow={5}
								tweenFactor={0.75}
								isOpen={true}
							/>
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
				</DialogContent>
			</DialogPortal>
		</Dialog>
	)
}
