'use client'

import { Card } from '@/components/Card'
import { Card as CardType } from '@/types/Card'
import { GamePlayer } from '@/types/Game'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import useGameContext from '../../../hooks/useGameContext'

type Props = {
	currentPlayer: GamePlayer
}

const startingHandSize = 10
const maxRerolls = 2

export const Reroll = ({ currentPlayer }: Props) => {
	const { gameState, addToContainer, removeFromContainer, setGameState } = useGameContext()

	const gameAccepted = gameState.players.filter(p => p.gameStatus === 'accepted').length === 2

	const [hand, setHand] = useState<CardType[]>([])
	const [rerolls, setRerolls] = useState(0)

	useEffect(() => {
		if (gameAccepted && currentPlayer) {
			const deck = currentPlayer.deck

			let newHand: CardType[] = hand

			while (newHand.length < startingHandSize) {
				const randomIndex = Math.floor(Math.random() * deck.length)

				const newCard = deck[randomIndex]

				if (newHand.includes(newCard)) continue

				newHand.push(newCard)
			}

			addToContainer(currentPlayer.id, newHand, 'hand')
			removeFromContainer(currentPlayer.id, newHand, 'deck')
			setHand(newHand)
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [gameAccepted])

	function selectRandomCard(deck: CardType[]): CardType | undefined {
		if (deck.length === 0) return undefined

		const randomIndex = Math.floor(Math.random() * deck.length)
		return deck[randomIndex]
	}

	const setGameStatus = (newStatus: GamePlayer['gameStatus']) => {
		// const newPlayer = {
		// 	...currentPlayer,
		// 	gameStatus: newStatus
		// }

		// const newGameState = {
		// 	...gameState,
		// 	players: gameState.players.map(p => (p.id === currentPlayer.id ? newPlayer : p))
		// }
		
		const newGameState = {
			...gameState,
			players: gameState.players.map(p => ({ ...p, gameStatus: newStatus }))
		}

		setGameState(newGameState)
	}

	function reroll(card: CardType) {
		if (rerolls >= maxRerolls) return

		const newCard = selectRandomCard(currentPlayer?.deck || [])
		if (!newCard) return

		const cardToChange = hand.indexOf(card)

		const newHand = hand
		newHand[cardToChange] = newCard

		addToContainer(currentPlayer?.id, newHand, 'hand', true)

		console.log('removing')
		removeFromContainer(currentPlayer?.id, [newCard], 'deck')
		addToContainer(currentPlayer?.id, [card], 'deck')

		setHand(newHand)
		setRerolls(prevRerolls => prevRerolls + 1)
	}

	useEffect(() => {
		if (rerolls === maxRerolls) {
			setTimeout(() => {
				setGameStatus('play')
			}, 0)
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rerolls])

	if (!currentPlayer) return null

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
						setGameStatus('play')
					}}
					className='fixed right-4 top-4 flex items-center gap-2 bg-secondary px-2 py-0.5'>
					<span className='text-sm'>Start game</span>
					<ArrowRight className='h-4 w-4' />
				</button>
			</div>
		</div>
	)
}
