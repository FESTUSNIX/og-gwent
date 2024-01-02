'use client'

import useGameContext from '@/app/play/[room]/hooks/useGameContext'
import { CardType } from '@/types/Card'
import { GamePlayer } from '@/types/Game'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Card } from './components/Card'

type Props = {
	player: GamePlayer
}

export const Hand = ({ player }: Props) => {
	const { gameState, addToPreview, clearPreview } = useGameContext()

	const cardRef = useRef<HTMLDivElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const sliderRef = useRef<HTMLDivElement>(null)

	const minGap = -42
	const maxGap = 2

	const numberOfCards = player.hand.length
	const isMyTurn = gameState.turn === player.id

	const [gap, setGap] = useState(0)
	const [widthConstraints, setWidthConstraints] = useState(0)

	const handleResize = () => {
		const cardWidth = cardRef.current?.clientWidth
		const containerWidth = containerRef.current?.clientWidth

		if (!cardWidth || !containerWidth) return

		const initialGap = Math.max(Math.min(containerWidth / numberOfCards - cardWidth, maxGap), minGap)
		const newGap = Math.max(Math.min((containerWidth - 16 + initialGap) / numberOfCards - cardWidth, maxGap), minGap)

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
	}, [numberOfCards])

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
		<div ref={containerRef} className='order-last h-full w-full overflow-x-clip border bg-stone-700 py-1'>
			<motion.div
				drag={gap <= minGap && 'x'}
				dragConstraints={{ right: widthConstraints, left: -widthConstraints }}
				ref={sliderRef}
				style={{ paddingRight: -gap }}
				className='flex h-full w-full max-w-full auto-cols-fr items-center justify-center'>
				{player.hand.map((card, i) => (
					<div
						key={i}
						style={{ marginRight: gap }}
						ref={cardRef}
						className='group relative flex aspect-[3/4] h-full w-auto max-w-full items-center justify-center duration-100 hover:z-10'>
						<Card card={card} setSelectedCard={setSelectedCard} selectedCard={selectedCard} disabled={!isMyTurn} />
					</div>
				))}
			</motion.div>
		</div>
	)
}
