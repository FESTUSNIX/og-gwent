import { Card } from '@/components/Card'
import { cn } from '@/lib/utils'
import { CardType } from '@/types/Card'
import { GameRow } from '@/types/Game'
import { WeatherEffect } from '@/types/WeatherEffect'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

type Props = {
	cards: CardType[]
	row: GameRow
	weatherEffect: WeatherEffect | undefined
	previewCard: CardType | null
	handleDecoy: (card: CardType) => void
}

export const Cards = ({ cards: _cards, row, weatherEffect, previewCard, handleDecoy }: Props) => {
	const cards = _cards.sort((a, b) => {
		if (a.strength === b.strength) {
			if (a.name < b.name) return -1
			if (a.name > b.name) return 1
			return 0
		}

		if (a.strength === undefined) return -1
		if (b.strength === undefined) return 1

		return a.strength - b.strength
	})

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
		<div ref={containerRef} className='relative z-30 h-full w-full overflow-x-clip'>
			<motion.div
				drag={gap <= minGap && 'x'}
				dragConstraints={{ right: widthConstraints, left: -widthConstraints }}
				ref={sliderRef}
				style={{ paddingRight: -gap }}
				className='flex h-full w-full max-w-full items-center justify-center'>
				{cards.map((card, i) => (
					<button
						key={i}
						style={{ marginRight: gap }}
						ref={cardRef}
						className={cn(
							'relative flex aspect-[3/4] h-full w-auto max-w-full cursor-auto items-center justify-center duration-100 hover:z-10 hover:mb-6',
							previewCard?.ability === 'decoy' && card.type === 'unit' && 'cursor-pointer'
						)}
						onClick={() => {
							handleDecoy(card)
						}}>
						<Card key={card.instance} card={card} mode='game' row={row} weatherEffect={weatherEffect} />
					</button>
				))}
			</motion.div>
		</div>
	)
}
