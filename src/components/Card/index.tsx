import { cn } from '@/lib/utils'
import { Card as CardType } from '@/types/Card'
import Image from 'next/image'
import { CSSProperties } from 'react'

type Props = {
	card: CardType
	mode?: 'game' | 'preview'
	className?: string
	style?: CSSProperties
}

const ASSET_PATH = '/game/card/'

export const Card = ({ card, mode = 'preview', className, style }: Props) => {
	return (
		<div
			style={style}
			className={cn(
				'relative z-0 flex aspect-[3/4] h-full w-auto max-w-full flex-col',
				mode === 'preview' && 'aspect-[410/775] rounded-xl',
				className
			)}>
			<div
				className={cn(
					'relative z-0 w-full grow overflow-hidden object-cover',
					mode === 'preview' && 'aspect-[2/3] h-auto w-full basis-3/4 rounded-t-lg'
				)}>
				<Image
					src={ASSET_PATH + `image/${card.factions[0]}/${card.slug}.jpg`}
					alt=''
					width={300}
					height={450}
					className='pointer-events-none absolute h-full w-full select-none object-cover'
				/>
			</div>

			<div className='absolute left-0 top-0 z-20 aspect-square h-auto w-3/5'>
				<div
					className={cn(
						'absolute left-0 top-0 z-20 h-full w-full font-medium text-black',
						card.isHero && 'text-white'
					)}>
					<div className='flex h-1/2 w-1/2 items-center justify-center'>
						<svg viewBox='0 0 35 35' className='h-full w-full'>
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
				<Image
					src={ASSET_PATH + `power/power_${card.isHero ? 'hero' : 'normal'}.png`}
					width={200}
					height={200}
					alt=''
					className='pointer-events-none absolute left-0 top-0 h-full w-full -translate-x-[7%] -translate-y-[7%] select-none'
				/>
			</div>

			<div
				className={cn(
					'absolute z-20 flex',
					mode === 'preview'
						? 'left-0 top-[30%] w-[30%] flex-col items-center gap-6'
						: 'bottom-1.5 right-0 w-full flex-row-reverse items-center gap-1'
				)}>
				<div className={cn('aspect-square h-auto rounded-full', mode === 'preview' ? 'w-[85%]' : 'w-1/3')}>
					<Image
						src={ASSET_PATH + `row/row_${card.type}.png`}
						alt=''
						width={80}
						height={80}
						className={cn('pointer-events-none h-full w-full select-none')}
					/>
				</div>
				<div>{/* TODO: ABILITY */}</div>
			</div>

			{mode === 'preview' && (
				<div className='absolute left-0 z-10 flex h-full w-[30%] flex-col items-center'>
					<Image
						src={ASSET_PATH + `banner/banner_${card.factions[0]}.png`}
						alt=''
						width={80}
						height={80}
						className={cn('pointer-events-none mt-[75%] h-[80%] w-auto -translate-x-[5%] select-none')}
					/>
				</div>
			)}

			{mode === 'preview' && (
				<div className='relative h-1/4 w-full shrink-0 basis-1/4 text-center'>
					<h3 className='relative z-10 h-3/5 pl-[25%] pr-[5%] pt-[5%] text-sm font-bold leading-tight text-[#333]'>
						<span className='sr-only'>{card.name}</span>
						<svg viewBox='0 0 130 40' aria-hidden className='h-full w-full'>
							<foreignObject x='0' y='0' width='100%' height='100%'>
								<div>{card.name}</div>
							</foreignObject>
						</svg>
					</h3>
					{card.description && (
						<div className='relative z-10 px-[5%] pt-[1.5%] text-sm leading-none tracking-tight text-black'>
							<span className='sr-only'>{card.description}</span>
							<svg viewBox='0 0 220 45' aria-hidden className='h-full w-full'>
								<foreignObject x='0' y='0' width='100%' height='100%'>
									<p>{card.description}</p>
								</foreignObject>
							</svg>
						</div>
					)}
					<Image
						src={ASSET_PATH + `details/details_${card.isHero ? 'hero' : 'normal'}.png`}
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
