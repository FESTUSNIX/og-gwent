'use client'

import { Card } from '@/components/Card'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { Dialog, DialogClose, DialogOverlay, DialogPortal } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { CardType } from '@/types/Card'
import { DialogContent } from '@radix-ui/react-dialog'
import { Slot } from '@radix-ui/react-slot'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { createContext, forwardRef, useCallback, useContext, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

type CardsPreviewProps = {
	cards?: CardType[]
	tweenFactor?: number
	slidesToShow?: number
	onCardSelect?: (card: CardType) => void
	onClose?: () => void
}

type OpenPreviewProps = {
	index?: number
} & CardsPreviewProps

type CardsPreviewContextProps = {
	isOpen: boolean
	openPreview: (props?: OpenPreviewProps) => void
} & CardsPreviewProps

const numberWithinRange = (number: number, min: number, max: number): number => Math.min(Math.max(number, min), max)

const CardsPreviewContext = createContext<CardsPreviewContextProps | null>(null)

export const useCardsPreview = () => {
	const context = useContext(CardsPreviewContext)

	if (!context) throw new Error('useCardsPreview must be used within a <CardsPreview/>')

	return context
}

export const CardsPreview = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & CardsPreviewProps>(
	(
		{
			cards: defaultCards,
			slidesToShow: defaultSlidesToShow = 5,
			tweenFactor: defaultTweenFactor = 0.75,
			className,
			children,
			onCardSelect: defaultOnCardSelect,
			onClose: defaultOnClose,
			...props
		},
		ref
	) => {
		const [items, setItems] = useState<CardType[] | undefined>(defaultCards)
		const [defaultCard, setDefaultCard] = useState(0)

		const [settings, setSettings] = useState<Omit<CardsPreviewProps, 'cards'>>({
			slidesToShow: defaultSlidesToShow,
			tweenFactor: defaultTweenFactor,
			onCardSelect: defaultOnCardSelect,
			onClose: defaultOnClose
		})

		const { slidesToShow, tweenFactor, onCardSelect, onClose } = settings

		const [isOpen, setIsOpen] = useState(false)

		const openPreview = useCallback(
			(props?: OpenPreviewProps) => {
				const { index, cards, onCardSelect, onClose, slidesToShow, tweenFactor } = props ?? {}

				cards && setItems(cards)

				setSettings({
					slidesToShow: slidesToShow ?? defaultSlidesToShow,
					tweenFactor: tweenFactor ?? defaultTweenFactor,
					onCardSelect: onCardSelect ?? defaultOnCardSelect,
					onClose: onClose ?? defaultOnClose
				})

				setDefaultCard(index ?? 0)

				setIsOpen(true)
			},
			[defaultSlidesToShow, defaultTweenFactor, defaultOnCardSelect, defaultOnClose]
		)

		useEffect(() => {
			if (!isOpen && onClose) onClose()
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [isOpen])

		useEffect(() => {
			defaultCards !== items && setItems(defaultCards)
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [defaultCards])

		return (
			<CardsPreviewContext.Provider
				value={{ cards: items, slidesToShow, tweenFactor, isOpen, openPreview, onClose, onCardSelect }}>
				<Dialog open={isOpen} onOpenChange={setIsOpen}>
					{children}

					<DialogPortal>
						<DialogOverlay className='bg-black/60' />
						<DialogContent className='z-50 max-w-full'>
							<div
								ref={ref}
								className={cn(
									'fixed left-[50%] top-[50%] z-50 flex w-[80vw] max-w-full translate-x-[-50%] translate-y-[-50%] items-center justify-center border-none'
								)}
								{...props}>
								{items && items?.length >= 1 ? (
									<CardsCarousel
										index={defaultCard}
										cards={items}
										onCardSelect={onCardSelect}
										slidesToShow={slidesToShow}
										tweenFactor={tweenFactor}
										isOpen={isOpen}
										setIsOpen={setIsOpen}
									/>
								) : (
									<div className='flex h-full w-full items-center justify-center'>
										<span className='text-2xl text-primary'>No cards to preview</span>
									</div>
								)}
							</div>

							<DialogClose asChild>
								<Button variant={'secondary'} size={'sm'} className='fixed bottom-10 right-8 z-10'>
									Close
								</Button>
							</DialogClose>
						</DialogContent>
					</DialogPortal>
				</Dialog>
			</CardsPreviewContext.Provider>
		)
	}
)

CardsPreview.displayName = 'CardsPreview'

export const CardsPreviewTrigger = forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & OpenPreviewProps & { asChild?: boolean }
>(
	(
		{
			className,
			index = 0,
			cards,
			onCardSelect,
			onClose,
			slidesToShow = 5,
			tweenFactor = 0.75,
			asChild = false,
			...props
		},
		ref
	) => {
		const { openPreview } = useCardsPreview()

		const Comp = asChild ? Slot : 'div'

		return (
			<Comp
				ref={ref}
				className={cn(className)}
				{...props}
				onContextMenu={e => {
					e.preventDefault()
					openPreview({
						index,
						cards,
						onCardSelect,
						onClose,
						slidesToShow,
						tweenFactor
					})
				}}
			/>
		)
	}
)
CardsPreviewTrigger.displayName = 'CardsPreviewTrigger'

export const CardsCarousel = forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & OpenPreviewProps & { isOpen: boolean; setIsOpen?: (open: boolean) => void }
>(
	(
		{ className, index = 0, cards, onCardSelect, slidesToShow = 5, tweenFactor = 0.75, isOpen, setIsOpen, ...props },
		ref
	) => {
		const [api, setApi] = useState<CarouselApi>()
		const [current, setCurrent] = useState(0)

		const [tweenValues, setTweenValues] = useState<number[]>([])

		const edgeToCenterAmount = Math.floor((slidesToShow ?? 0) / 2)

		const handleCardSelect = useCallback(
			(card: CardType) => {
				if (!onCardSelect) return

				onCardSelect(card)
				setIsOpen && setIsOpen(false)
			},
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[onCardSelect]
		)

		const scrollTo = useCallback(
			(index: number) => {
				api?.scrollTo(index)
			},
			[api]
		)

		const scrollPrev = useCallback(() => {
			api?.scrollPrev()
		}, [api])

		const scrollNext = useCallback(() => {
			api?.scrollNext()
		}, [api])

		useEffect(() => {
			if (!isOpen) return

			const handleKeyPress = (event: KeyboardEvent) => {
				if (event.key === 'ArrowLeft') {
					event.preventDefault()

					scrollPrev()
				} else if (event.key === 'ArrowRight') {
					event.preventDefault()

					scrollNext()
				}

				if (event.key === 'Enter') {
					event.preventDefault()

					if (cards && cards[current - edgeToCenterAmount]) {
						handleCardSelect(cards[current - edgeToCenterAmount])
					}
				}
			}

			document.addEventListener('keydown', handleKeyPress)

			return () => {
				document.removeEventListener('keydown', handleKeyPress)
			}

			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [isOpen, api, current])

		const onScroll = useCallback(() => {
			if (!api) return

			const engine = api.internalEngine()
			const scrollProgress = api.scrollProgress()

			const list = api.scrollSnapList()

			const styles = list.map((scrollSnap, index) => {
				let diffToTarget = scrollSnap - scrollProgress

				if (engine.options.loop) {
					engine.slideLooper.loopPoints.forEach(loopItem => {
						const target = loopItem.target()
						if (index === loopItem.index && target !== 0) {
							const sign = Math.sign(target)
							if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress)
							if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress)
						}
					})
				}

				const tweenValue = 1 - Math.abs(diffToTarget * ((list.length * (tweenFactor ?? 0)) / (slidesToShow ?? 0)))
				return numberWithinRange(tweenValue, 0, 1)
			})
			setTweenValues(styles)
		}, [api, setTweenValues, slidesToShow, tweenFactor])

		useEffect(() => {
			if (!api) return

			setCurrent(api.selectedScrollSnap() + edgeToCenterAmount)

			api.on('select', () => {
				setCurrent(api.selectedScrollSnap() + edgeToCenterAmount)
			})

			onScroll()
			api.on('scroll', () => {
				flushSync(() => onScroll())
			})
			api.on('reInit', onScroll)

			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [api])

		const nullEntries: null[] = new Array(edgeToCenterAmount).fill(null)

		return (
			<Carousel
				ref={ref}
				setApi={a => setApi(a)}
				opts={{
					align: 'center',
					loop: false,
					duration: 10,
					startIndex: index
				}}
				plugins={[
					WheelGesturesPlugin({
						forceWheelAxis: 'y',
						wheelDraggingClass: 'wheel-drag'
					})
				]}
				className={cn('w-full', className)}
				{...props}>
				<CarouselContent className='py-4'>
					{[...nullEntries, ...(cards ?? []), ...nullEntries].map((card, i) => (
						<CarouselItem
							key={i}
							className={''}
							style={{
								flexBasis: `${100 / (slidesToShow ?? 0)}%`
							}}>
							<div
								className={cn(
									'relative h-full origin-top',
									current === i && card && 'rounded-xl bg-primary p-1',
									current === i && onCardSelect && 'cursor-pointer'
								)}
								onClick={() => {
									if (card && i !== current) {
										scrollTo(i - edgeToCenterAmount)
									}
									if (card && i === current) {
										handleCardSelect(card)
									}
								}}
								style={{
									...(tweenValues.length && {
										transform: `scale(${tweenValues[i - edgeToCenterAmount]})`
									})
								}}>
								{card && <Card card={card} mode='preview' />}
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>
		)
	}
)
CardsCarousel.displayName = 'CardsCarousel'
