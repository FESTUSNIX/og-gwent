import { Card } from '@/components/Card'
import { CardType } from '@/types/Card'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

type Props = {
	cards: CardType[]
}

export const Cards = ({ cards }: Props) => {
	const cardRef = useRef<HTMLDivElement>(null)
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
		<div ref={containerRef} className='h-full w-full overflow-x-clip border'>
			<motion.div
				drag={gap <= minGap && 'x'}
				dragConstraints={{ right: widthConstraints, left: -widthConstraints }}
				ref={sliderRef}
				style={{ paddingRight: -gap }}
				className='flex h-full w-full max-w-full items-center justify-center'>
				{cards.map((card, i) => (
					<div
						key={i}
						style={{ marginRight: gap }}
						ref={cardRef}
						className='relative flex aspect-[3/4] h-full w-auto max-w-full items-center justify-center border duration-100 hover:z-10 hover:mb-6'>
						<Card key={card.id} card={card} mode='game' />
					</div>
				))}
			</motion.div>
		</div>
	)
}
