'use client'

import { Card } from '@/components/Card'
import { GamePlayer } from '@/types/Game'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

type Props = {
	player: GamePlayer
}

export const Hand = ({ player }: Props) => {
	const cardRef = useRef<HTMLButtonElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const sliderRef = useRef<HTMLDivElement>(null)

	const minGap = -42
	const maxGap = 4

	const numberOfCards = player.hand.length

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
		// on window resize, recalculate gap

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
		<div>
			<div ref={containerRef} className='h-44 w-full overflow-x-clip border bg-stone-700 py-1'>
				<motion.div
					drag={gap <= minGap && 'x'}
					dragConstraints={{ right: widthConstraints, left: -widthConstraints }}
					ref={sliderRef}
					style={{ paddingRight: -gap }}
					className='hand-s flex h-full w-full max-w-full items-center justify-center'>
					{player.hand.map((card, i) => (
						<button
							key={i}
							style={{ marginRight: gap }}
							ref={cardRef}
							className='h-full w-auto max-w-full duration-100 hover:z-10 hover:mb-12'>
							<Card card={card} mode='game' className='border' />
						</button>
					))}
				</motion.div>
			</div>
		</div>
	)
}
