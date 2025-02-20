import { FACTIONS } from '@/constants/FACTIONS'
import { cn, getVw } from '@/lib/utils'
import { FactionType } from '@/types/Faction'
import { GamePlayer } from '@/types/Game'
import { motion } from 'framer-motion'
import Image from 'next/image'

type Props = Pick<GamePlayer, 'deck'> & { side: 'host' | 'opponent'; faction: Omit<FactionType, 'neutral'> }

export const Deck = ({ deck, side, faction }: Props) => {
	const factionDeckImage = FACTIONS.find(f => f.slug === faction)?.images?.deckBack

	return (
		<div className='relative z-0 flex aspect-[2/3] w-[50%] items-center justify-center'>
			<div className='pointer-events-none relative h-full w-full select-none'>
				{factionDeckImage && deck.length > 0 && (
					<Image
						src={factionDeckImage}
						alt=''
						width={150}
						height={200}
						className='pointer-events-none relative z-10 h-full w-full select-none'
					/>
				)}

				{new Array(Math.floor(deck.length / 2)).fill(0).map((_, i) => (
					<span
						key={i}
						className={cn(
							'absolute left-0 top-0 z-0 h-full w-full',
							'after:absolute after:-bottom-px after:left-0 after:z-10 after:block after:h-[1px] after:w-full after:bg-[#f6e9aa]',
							'before:absolute before:-right-px before:top-0 before:z-0 before:block before:h-full before:w-[1px] before:bg-[#8c7413]'
						)}
						style={{
							transform: `translate(${(i * 2) / 2}%, ${(i * 2) / 3}%)`
						}}
					/>
				))}
			</div>

			<div className='absolute bottom-0 left-1/2 z-20 -translate-x-1/2 bg-black/80 px-[18%] py-[2.25%]'>
				<span className='sr-only'>Deck length </span>
				<span className='font-bold leading-tight' style={{ fontSize: getVw(24) }}>
					{deck.length}
				</span>
			</div>

			<div className='absolute'>
				{deck.map(card => (
					<motion.div
						layoutId={`card-${card.id}-${card.instance}`}
						key={card.instance}
						className='pointer-events-none absolute z-50'></motion.div>
				))}
			</div>
		</div>
	)
}
