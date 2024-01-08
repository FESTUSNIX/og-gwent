import useGameContext from '@/app/play/[room]/hooks/useGameContext'
import { cn } from '@/lib/utils'
import { GamePlayer } from '@/types/Game'
import { RowType } from '@/types/RowType'
import { ArrowBigUpDash } from 'lucide-react'
import { CSSProperties } from 'react'
import { Cards } from './components/Cards'

type Props = {
	rowType: RowType
	player: GamePlayer
	side: 'host' | 'opponent'
	className?: string
	style?: CSSProperties
}

export const Row = ({ rowType, player, side, className, style }: Props) => {
	const { gameState, addToRow, removeFromContainer, clearPreview, setTurn } = useGameContext()
	const previewedCard = player.preview

	const row = player.rows[rowType]
	const opponent = gameState.players.find(p => p.id !== player.id)!

	const canAdd = previewedCard && previewedCard?.type === rowType && player.id === player.id && !player.hasPassed

	const addCardToRow = () => {
		if (canAdd) {
			addToRow(player.id, previewedCard, rowType)
			removeFromContainer(player.id, [previewedCard], 'hand')

			clearPreview(player.id)

			if (opponent.hasPassed) return

			setTurn(gameState.turn === player.id ? opponent.id : gameState.turn)
		}
	}

	return (
		<div className={cn('relative flex grow items-center', className)} style={style}>
			<div className='absolute left-0 flex h-full -translate-x-full items-center'>
				<div
					className={cn(
						'z-10 -mr-1.5 flex aspect-square h-12 w-12 translate-x-0.5 items-center justify-center rounded-full border-[3px] border-neutral-500 text-black',
						side === 'host' ? 'bg-orange-300' : 'bg-blue-300'
					)}>
					<span className='text-2xl'>{row.cards.reduce((acc, card) => acc + card.strength, 0)}</span>
				</div>
				<div className='h-full w-3 rounded-l-md bg-neutral-500' />
			</div>
			<button className='flex aspect-square h-full w-auto cursor-auto items-center justify-center bg-stone-800'>
				<ArrowBigUpDash className='h-20 w-20 text-white/5' />
			</button>
			<button
				className={cn(
					'relative h-full w-full grow cursor-auto bg-stone-700',
					canAdd && side === 'host' && 'cursor-pointer ring-4 ring-inset ring-yellow-600'
				)}
				onClick={() => {
					addCardToRow()
				}}>
				<Cards cards={row.cards} />

				<div className='absolute'></div>
			</button>
		</div>
	)
}
