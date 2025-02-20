'use client'

import { calculateCardStrength } from '@/lib/calculateScores'
import { cn } from '@/lib/utils'
import { Card as CardType } from '@/types/Card'
import { FactionType } from '@/types/Faction'
import { GameRow } from '@/types/Game'
import { WeatherEffect } from '@/types/WeatherEffect'
import { HTMLMotionProps, motion } from 'framer-motion'
import cardsJson from '../../../db/cards.json'

type Props = {
	row?: GameRow
	weatherEffect?: WeatherEffect
	card: Pick<CardType, 'id' | 'instance' | 'amount'>
	useLayoutAnimation?: boolean
} & (
	| {
			mode?: 'preview'
			forceBanner?: FactionType
			displayAmount?: boolean
	  }
	| {
			mode?: 'game'
			forceBanner?: undefined
			displayAmount?: undefined
	  }
) &
	HTMLMotionProps<'div'>

const ASSET_PATH = '/game/card/'

export const Card = ({
	card: _card,
	mode = 'preview',
	forceBanner,
	row,
	weatherEffect,
	displayAmount,
	className,
	style,
	useLayoutAnimation = false,
	...props
}: Props) => {
	const { id, amount, instance } = _card

	const cards = cardsJson.cards as Omit<CardType, 'instance'>[]
	const card: CardType = { ...cards.find(c => c.id === id)!, instance }

	const useBanner = forceBanner ?? (card?.factions[0] !== 'neutral' && mode === 'preview')
	const cardScore = calculateCardStrength(card, row, weatherEffect)

	const getLayoutId = (suffix?: string) =>
		useLayoutAnimation ? `card-${card.id}-${instance}${suffix ? `-${suffix}` : ''}` : undefined

	return (
		<motion.div
			{...props}
			layoutId={getLayoutId()}
			style={style}
			className={cn(
				'relative z-0 flex h-full w-auto max-w-full flex-col',
				mode === 'preview' && 'aspect-[410/775]',
				mode === 'game' && 'aspect-[3/4] rounded-sm',
				className
			)}>
			<div
				className={cn(
					'relative z-0 w-full grow overflow-hidden bg-cover bg-center bg-no-repeat object-cover',
					mode === 'preview' && 'aspect-[2/3] h-auto w-full basis-3/4 rounded-t-[1vw]',
					mode === 'game' && 'rounded-[2%]'
				)}
				style={{ backgroundImage: `url(${ASSET_PATH}image/${card.factions[0]}/${card.slug}.jpg)` }}></div>

			<div className={cn('absolute left-0 top-0 z-20 aspect-square h-auto', mode === 'preview' ? 'w-3/5' : 'w-2/3')}>
				{card.strength !== undefined && (
					<div
						className={cn(
							'absolute left-0 top-0 z-20 h-full w-full font-medium text-black',
							card.type === 'hero' && 'text-white',
							cardScore && cardScore > card.strength && 'text-green-700',
							cardScore && cardScore < card.strength && 'text-red-800'
						)}>
						<div className='flex h-1/2 w-1/2 items-center justify-center'>
							<svg viewBox='0 0 36 36' className='h-full w-full'>
								<text
									x='50%'
									y='50%'
									textAnchor='middle'
									dominantBaseline={'central'}
									fill='currentColor'
									className='opacity-90'>
									{cardScore}
								</text>
							</svg>
						</div>
					</div>
				)}
				<div
					className='pointer-events-none absolute left-0 top-0 h-full w-full -translate-x-[7%] -translate-y-[7%] select-none bg-cover bg-center bg-no-repeat'
					style={{
						backgroundImage: `url(${ASSET_PATH}power/${
							card.type === 'hero'
								? 'hero'
								: card.type === 'special' || card.type === 'weather'
								? card.ability
								: 'normal'
						}.png)`
					}}
				/>
			</div>

			{card.type !== 'special' && card.type !== 'weather' && (
				<div
					className={cn(
						'absolute z-20 flex',
						mode === 'preview'
							? 'left-0 top-[28%] w-[30%] flex-col items-center'
							: 'bottom-[5%] right-0 w-full flex-row-reverse items-center'
					)}>
					<div
						className={cn(
							'aspect-square h-auto rounded-full bg-contain bg-center bg-no-repeat',
							mode === 'preview' ? 'w-[85%]' : 'w-[30%]'
						)}
						style={{
							backgroundImage: `url(${ASSET_PATH}row/row_${card.row}.png)`
						}}
					/>
					{card.ability && (
						<div
							className={cn(
								'aspect-square h-auto rounded-full bg-contain bg-center bg-no-repeat',
								mode === 'preview' ? 'mt-[25%] w-[85%]' : 'mr-[5%] w-[30%]'
							)}
							style={{
								backgroundImage: `url(${ASSET_PATH}ability/${card.ability.split('-')[0]}.png)`
							}}
						/>
					)}
				</div>
			)}

			{useBanner && (
				<div className='absolute left-0 z-10 flex h-full w-[30%] flex-col items-center'>
					<div
						className={cn(
							'pointer-events-none mt-[90%] h-[77%] w-auto -translate-x-[5%] select-none bg-contain bg-center bg-no-repeat'
						)}
						style={{
							backgroundImage: `url(${ASSET_PATH}banner/banner_${forceBanner ?? card.factions[0]}.png)`
						}}
					/>
				</div>
			)}

			{mode === 'preview' && (
				<div
					className={cn(
						'relative flex h-1/4 w-full shrink-0 basis-1/4 flex-col text-center',
						mode === 'preview' && 'overflow-hidden rounded-b-[1vw]'
					)}>
					<h3
						className={cn(
							'relative z-10 h-3/5 pr-[5%] pt-[5%] text-sm font-bold leading-tight text-[#333]',
							useBanner ? 'pl-[25%]' : 'pl-[5%]'
						)}>
						<span className='sr-only'>{card.name}</span>
						<svg viewBox='0 0 130 40' aria-hidden className='h-full w-full'>
							<foreignObject x='0' y='0' width='100%' height='100%'>
								<div>{card.name}</div>
							</foreignObject>
						</svg>
					</h3>
					{displayAmount && (
						<div className='relative z-10 flex h-full items-center px-[5%] pt-[5%]'>
							<div className='mr-[2%] h-2/3 w-auto bg-[url(/game/icons/card_amount.png)] bg-contain bg-center bg-no-repeat' />

							<div className='text-start font-normal leading-none tracking-tight text-[#726549]'>
								<span className='sr-only'>{amount ?? 1}</span>
								<svg viewBox='0 0 120 15' aria-hidden className='h-full w-full'>
									<foreignObject x='0' y='0' width='100%' height='100%'>
										<p>x{amount ?? 1}</p>
									</foreignObject>
								</svg>
							</div>
						</div>
					)}
					{card.description && (
						<div className='relative z-10 px-[5%] pt-[3.5%] text-sm leading-none tracking-tight text-black'>
							<span className='sr-only'>{card.description}</span>
							<svg viewBox='0 0 230 45' aria-hidden className='h-full w-full'>
								<foreignObject x='0' y='0' width='100%' height='100%'>
									<p className='text-pretty'>{card.description}</p>
								</foreignObject>
							</svg>
						</div>
					)}
					<div
						style={{
							backgroundImage: `url(${ASSET_PATH}details/details_${card.type === 'hero' ? 'hero' : 'normal'}.png)`
						}}
						className='pointer-events-none absolute top-0 z-0 h-full w-full select-none bg-cover bg-center bg-no-repeat object-fill'
					/>
				</div>
			)}
		</motion.div>
	)
}
