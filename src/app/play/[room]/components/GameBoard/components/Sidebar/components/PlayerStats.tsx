import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FACTIONS } from '@/constants/FACTIONS'
import { cn } from '@/lib/utils'
import { GamePlayer } from '@/types/Game'

type Props = {
	player: GamePlayer
	side: 'host' | 'opponent'
}

export const PlayerStats = ({ player, side }: Props) => {
	return (
		<div className={cn('flex flex-col gap-6', side === 'opponent' && 'flex-col-reverse')}>
			<div className='relative flex items-center gap-4 py-2.5 pl-12'>
				<div className='flex aspect-square h-full items-center justify-center rounded-full border bg-stone-700'>
					<Avatar className='h-full w-full'>
						<AvatarFallback>{player.name.slice(0, 2).toUpperCase()}</AvatarFallback>
					</Avatar>
				</div>

				<div className={cn('flex grow flex-col gap-4 pr-10', side === 'opponent' && 'flex-col-reverse')}>
					<div className='flex items-center gap-8'>
						<div>
							<span className='text-2xl'>{player.hand.length}</span>
						</div>
						<div className='flex items-center gap-1'>
							{[0, 1].map((life, i) => (
								<div
									key={i}
									className={cn('aspect-square w-7 rounded-full bg-red-500', i >= player.lives && 'bg-gray-600')}
								/>
							))}
						</div>
					</div>

					<div>
						<h3 className='font-bold'>{player.name}</h3>
						<p className='text-sm'>{FACTIONS.find(f => f.slug === player.faction)?.name}</p>
					</div>
				</div>

				<div className='absolute right-0 top-1/2 flex aspect-square w-14 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border bg-stone-800'>
					<span className='text-3xl'>
						{Object.values(player.rows).reduce(
							(acc, row) => acc + row.cards.reduce((acc, card) => acc + card.strength, 0),
							0
						)}
					</span>
				</div>

				<div className='absolute inset-0 -z-10 h-full w-full bg-black/25' />
			</div>

			<div className='ml-12 flex aspect-[45/60]  w-28 items-center justify-center bg-stone-900'>Leader Card</div>
		</div>
	)
}
