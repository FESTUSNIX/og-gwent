import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Card as CardType } from '@/types/Card'
import { FactionType } from '@/types/Faction'
import Image from 'next/image'
import { HTMLAttributes } from 'react'
import { Base64Img } from './Base64Img'

type Props = {
	card: Omit<CardType, 'id' | 'instance' | 'amount' | 'slug' | 'group'> & {
		image: string
	}
} & (
	| {
			mode?: 'preview'
			forceBanner?: FactionType
	  }
	| {
			mode?: 'game'
			forceBanner?: undefined
	  }
) &
	HTMLAttributes<HTMLDivElement>

const ASSET_PATH = '/game/card/'

export const Card = ({ card, mode = 'preview', forceBanner, className, style, ...props }: Props) => {
	const useBanner = forceBanner ?? (card.factions[0] && card?.factions[0] !== 'neutral' && mode === 'preview')

	return (
		<div
			{...props}
			style={style}
			className={cn(
				'relative z-0 flex h-full w-auto max-w-full flex-col',
				mode === 'preview' && 'aspect-[410/775]',
				mode === 'game' && 'aspect-[3/4] rounded-sm',
				className
			)}>
			<div
				className={cn(
					'relative z-0 w-full grow overflow-hidden object-cover',
					mode === 'preview' && 'aspect-[2/3] h-auto w-full basis-3/4 rounded-t-xl',
					mode === 'game' && 'rounded-[2%]'
				)}>
				{card.image ? (
					<Base64Img
						src={card.image}
						alt=''
						width={450}
						height={700}
						className='absolute z-10 h-full w-full object-cover'
					/>
				) : (
					<Skeleton className='relative z-0 size-full' />
				)}
			</div>

			<div className={cn('absolute left-0 top-0 z-20 aspect-square h-auto', mode === 'preview' ? 'w-3/5' : 'w-2/3')}>
				{(card.strength || card.strength === 0) && card.type !== 'weather' && card.type !== 'special' && (
					<div
						className={cn(
							'absolute left-0 top-0 z-20 h-full w-full font-medium text-black',
							card.type === 'hero' && 'text-white'
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
									{card.strength}
								</text>
							</svg>
						</div>
					</div>
				)}
				{!((card.type === 'weather' || card.type === 'special') && !card.ability) && (
					<Image
						src={
							ASSET_PATH +
							`power/${
								card.type === 'hero'
									? 'hero'
									: card.type === 'special' || card.type === 'weather'
									? card.ability
									: 'normal'
							}.png`
						}
						width={200}
						height={200}
						alt=''
						className='pointer-events-none absolute left-0 top-0 h-full w-full -translate-x-[7%] -translate-y-[7%] select-none'
					/>
				)}
			</div>

			{card.type !== 'special' && card.type !== 'weather' && (
				<div
					className={cn(
						'absolute z-20 flex',
						mode === 'preview'
							? 'left-0 top-[28%] w-[30%] flex-col items-center'
							: 'bottom-[5%] right-0 w-full flex-row-reverse items-center'
					)}>
					{card.row && (
						<div className={cn('aspect-square h-auto rounded-full', mode === 'preview' ? 'w-[85%]' : 'w-[30%]')}>
							<Image
								src={ASSET_PATH + `row/row_${card.row}.png`}
								alt=''
								width={80}
								height={80}
								className={cn('pointer-events-none h-full w-full select-none')}
							/>
						</div>
					)}
					{card.ability && (
						<div
							className={cn(
								'aspect-square h-auto rounded-full',
								mode === 'preview' ? 'mt-[25%] w-[85%]' : 'mr-[5%] w-[30%]'
							)}>
							<Image
								src={ASSET_PATH + `ability/${card.ability.split('-')[0]}.png`}
								alt=''
								width={80}
								height={80}
								className={cn('pointer-events-none h-full w-full select-none')}
							/>
						</div>
					)}
				</div>
			)}

			{useBanner && (
				<div className='absolute left-0 z-10 flex h-full w-[30%] flex-col items-center'>
					<Image
						src={ASSET_PATH + `banner/banner_${forceBanner ?? card.factions[0]}.png`}
						alt=''
						width={80}
						height={80}
						className={cn('pointer-events-none mt-[90%] h-[77%] w-auto -translate-x-[5%] select-none')}
					/>
				</div>
			)}

			{mode === 'preview' && (
				<div
					className={cn(
						'relative flex h-1/4 w-full shrink-0 basis-1/4 flex-col text-center',
						mode === 'preview' && 'overflow-hidden rounded-b-xl'
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
					<Image
						src={ASSET_PATH + `details/details_${card.type === 'hero' ? 'hero' : 'normal'}.png`}
						alt=''
						width={300}
						height={150}
						className='pointer-events-none absolute top-0 z-0 h-full w-full select-none object-fill'
					/>
				</div>
			)}
		</div>
	)
}
