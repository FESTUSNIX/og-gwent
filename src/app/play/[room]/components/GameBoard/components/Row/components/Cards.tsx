import { useAnimatedCards } from '@/app/play/[room]/context/AnimatedCardsContext'
import { Card } from '@/components/Card'
import { cn, sortCards } from '@/lib/utils'
import { CardType } from '@/types/Card'
import { GameRow } from '@/types/Game'
import { WeatherEffect } from '@/types/WeatherEffect'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

type Props = {
	cards: CardType[]
	row: GameRow
	side: 'host' | 'opponent'
	weatherEffect: WeatherEffect | undefined
	previewCard: CardType | null
	handleDecoy: (card: CardType) => void
}

export const Cards = ({ cards: _cards, row, weatherEffect, previewCard, handleDecoy, side }: Props) => {
	const cards = sortCards(_cards)
	const { animatedCards, setAnimatedCards } = useAnimatedCards()

	const cardRef = useRef<HTMLButtonElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const sliderRef = useRef<HTMLDivElement>(null)

	const minGap = -42
	const maxGap = 2

	const numberOfCards = cards.length

	const [gap, setGap] = useState(0)
	const [widthConstraints, setWidthConstraints] = useState(0)

	const handleResize = () => {
		const cardWidth = cardRef.current?.clientWidth
		const containerWidth = containerRef.current?.clientWidth

		if (!cardWidth || !containerWidth) return

		const initialGap = Math.max(Math.min(containerWidth / numberOfCards - cardWidth, maxGap), minGap)
		const newGap = Math.max(Math.min((containerWidth + initialGap) / numberOfCards - cardWidth, maxGap), minGap)

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

	return (
		<div ref={containerRef} className='relative z-30 h-full w-full min-w-0 overflow-x-clip'>
			<motion.div
				drag={gap <= minGap && 'x'}
				dragConstraints={{ right: widthConstraints, left: -widthConstraints }}
				ref={sliderRef}
				style={{ paddingRight: -gap }}
				className='flex h-full w-full max-w-full items-center justify-center'>
				{cards
					.filter(c => !animatedCards.some(animatedCard => animatedCard.instance === c.instance))
					.map((card, i) => (
						<motion.button
							key={card.instance}
							style={{ marginRight: gap }}
							ref={cardRef}
							className={cn(
								'relative flex aspect-[3/4] h-full w-auto max-w-full cursor-auto items-center justify-center duration-100 hover:z-10 hover:mb-6',
								previewCard?.ability === 'decoy' && card.type === 'unit' && 'cursor-pointer'
							)}
							onClick={() => {
								handleDecoy(card)
							}}>
							<Card
								key={card.instance}
								card={card}
								mode='game'
								row={row}
								weatherEffect={weatherEffect}
								useLayoutAnimation
							/>
						</motion.button>
					))}
			</motion.div>
		</div>
	)
}
