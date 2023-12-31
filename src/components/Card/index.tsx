import { cn } from '@/lib/utils'
import { Card as CardType } from '@/types/Card'
import { Sword } from 'lucide-react'
import { Icons } from '../Icons'
import { CSSProperties } from 'react'

type Props = {
	card: CardType
	mode?: 'game' | 'preview'
	className?: string
	style?: CSSProperties
}

export const Card = ({ card, mode = 'preview', className, style }: Props) => {
	const typeIconStyles = cn('text-black', mode === 'preview' ? 'h-6 w-6' : 'h-5 w-5')

	return (
		<div
			style={style}
			className={cn(
				'relative flex aspect-[3/4] h-full w-auto max-w-full flex-col bg-stone-500',
				mode === 'preview' && 'rounded-lg',
				className
			)}>
			<div
				className={cn('w-full grow overflow-hidden bg-stone-600 object-cover', mode === 'preview' && 'rounded-t-lg')}>
				{/* IMAGE */}
			</div>

			<div
				className={cn(
					'absolute left-0 top-0 flex items-center justify-center rounded-full border-2 border-yellow-500 bg-stone-800',
					card.isHero && 'bg-yellow-600',
					mode === 'preview' ? 'h-12 w-12' : 'h-9 w-9'
				)}>
				<span className='text-xl'>{card.strength}</span>
			</div>

			<div
				className={cn(
					'absolute flex items-center',
					mode === 'preview' ? 'left-1 top-20 flex-col gap-4' : 'bottom-1.5 right-0 flex-row-reverse gap-1'
				)}>
				<div
					className={cn(
						'flex items-center justify-center rounded-full border border-yellow-800 bg-yellow-500',
						mode === 'preview' ? 'h-11 w-11' : 'h-8 w-8'
					)}>
					{card.type === 'melee' && <Sword className={typeIconStyles} />}
					{card.type === 'range' && <Icons.BowArrow className={typeIconStyles} />}
					{card.type === 'siege' && <Icons.Catapult className={typeIconStyles} />}
				</div>
				<div>{/* ABILITY */}</div>
			</div>

			{mode === 'preview' && (
				<div className='h-16 w-full border-t-2 border-t-yellow-700 py-2 text-center'>
					<h3 className='px-4 text-sm font-bold'>{card.name}</h3>
				</div>
			)}
		</div>
	)
}
