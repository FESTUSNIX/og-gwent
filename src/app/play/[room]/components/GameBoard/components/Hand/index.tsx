'use client'

import useGameContext from '@/app/play/[room]/hooks/useGameContext'
import { CardsPreview, CardsPreviewTrigger } from '@/components/CardsPreview'
import { sortCards } from '@/lib/utils'
import { CardType } from '@/types/Card'
import { GamePlayer } from '@/types/Game'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Card } from './components/Card'

type Props = {
	player: GamePlayer
}

export const Hand = ({ player }: Props) => {
	const {
		gameState,
		actions: { addToPreview, clearPreview }
	} = useGameContext()

	const cards = sortCards(player.hand)

	const cardRef = useRef<HTMLDivElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const sliderRef = useRef<HTMLDivElement>(null)

	const minGap = -42
	const maxGap = 2

	const isMyTurn = gameState.turn === player.id

	const [gap, setGap] = useState(0)
	const [widthConstraints, setWidthConstraints] = useState(0)

	const handleResize = () => {
		const cardWidth = cardRef.current?.clientWidth
		const containerWidth = containerRef.current?.clientWidth

		if (!cardWidth || !containerWidth) return

		const initialGap = Math.max(Math.min(containerWidth / cards.length - cardWidth, maxGap), minGap)
		const newGap = Math.max(Math.min((containerWidth - 16 + initialGap) / cards.length - cardWidth, maxGap), minGap)

		setGap(newGap)
	}

	const debounce = <F extends (...args: any[]) => void>(func: F, delay: number) => {
		let timeoutId: NodeJS.Timeout
		return function (...args: Parameters<F>) {
			if (timeoutId) {
				clearTimeout(timeoutId)
			}
			timeoutId = setTimeout(() => {
				func(...args)
			}, delay)
		}
	}

	useEffect(() => {
		setWidthConstraints((sliderRef.current?.scrollWidth ?? 1) - (containerRef.current?.offsetWidth ?? 0))
	}, [widthConstraints])

	useEffect(() => {
		const handleWindowResize = debounce(() => {
			handleResize()
		}, 200)

		window.addEventListener('resize', handleWindowResize)
		handleWindowResize()

		return () => {
			window.removeEventListener('resize', handleWindowResize)
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cards.length])

	const [selectedCard, setSelectedCard] = useState<CardType | null>(null)

	useEffect(() => {
		if (selectedCard) {
			addToPreview(player.id, selectedCard)
		} else {
			clearPreview(player.id)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedCard])

	return (
		<div ref={containerRef} className='relative z-20 order-last h-[calc(100%/7)] w-full overflow-x-clip py-1'>
			<CardsPreview
				cards={cards}
				onCardSelect={card => {
					setSelectedCard(card)
				}}>
				<motion.div
					drag={gap <= minGap && 'x'}
					dragConstraints={{ right: widthConstraints, left: -widthConstraints }}
					ref={sliderRef}
					style={{ paddingRight: -gap }}
					className='relative z-10 flex h-full w-full max-w-full auto-cols-fr items-center justify-center'>
					{cards.map((card, i) => (
						<CardsPreviewTrigger
							key={i}
							index={i}
							style={{ marginRight: gap }}
							ref={cardRef}
							className='group relative flex aspect-[3/4] h-full w-auto max-w-full items-center justify-center duration-100 hover:z-[100]'>
							<AnimatePresence mode='wait' key={card.instance}>
								<Card card={card} setSelectedCard={setSelectedCard} selectedCard={selectedCard} disabled={!isMyTurn} />
							</AnimatePresence>
						</CardsPreviewTrigger>
					))}
				</motion.div>
			</CardsPreview>

			<div
				style={{ backgroundImage: `url("/game/board/hand.png")` }}
				className='absolute inset-0 top-0 z-0 h-[calc(105%)] w-full bg-top bg-no-repeat [background-size:100%_100%]'
			/>
		</div>
	)
}
