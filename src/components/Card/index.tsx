import { cn } from '@/lib/utils'
import { Card as CardType } from '@/types/Card'
import { Sword } from 'lucide-react'
import { Icons } from '../Icons'

type Props = {
	card: CardType
	mode?: 'game' | 'preview'
	className?: string
}

export const Card = ({ card, mode = 'preview', className }: Props) => {
	return (
		<div
			className={cn(
				'relative flex aspect-[40/60] h-full w-auto max-w-full flex-col bg-stone-500',
				mode === 'preview' && 'rounded-lg',
				className
			)}>
			<div
				className={cn('w-full grow overflow-hidden bg-stone-600 object-cover', mode === 'preview' && 'rounded-t-lg')}>
				{/* IMAGE */}
			</div>

			<div
				className={cn(
					'absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border-2 border-yellow-500 bg-stone-800',
					card.isHero && 'bg-yellow-600'
				)}>
				<span className='text-2xl'>{card.strength}</span>
			</div>

			<div
				className={cn(
					'absolute flex items-center',
					mode === 'preview' ? 'left-1 top-20 flex-col gap-4' : 'bottom-2 right-0 flex-row gap-1'
				)}>
				<div
					className={cn(
						'flex h-11 w-11 items-center justify-center rounded-full border border-yellow-800 bg-yellow-500'
					)}>
					{card.type === 'melee' && (
						<div className=''>
							<Sword className='h-6 w-6 text-black' />
							<span className='sr-only'>Melee</span>
						</div>
					)}
					{card.type === 'range' && (
						<div className=''>
							<Icons.BowArrow className='h-6 w-6 text-black' />
							<span className='sr-only'>Range</span>
						</div>
					)}
					{card.type === 'siege' && (
						<div className=''>
							<Icons.Catapult className='h-6 w-6 text-black' />
							<span className='sr-only'>Melee</span>
						</div>
					)}
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
