import useGameContext from '@/app/play/[room]/hooks/useGameContext'
import { getCurrentPlayerId } from '@/lib/getCurrentPlayerId'
import { cn } from '@/lib/utils'
import { GamePlayer } from '@/types/Game'
import { RowType } from '@/types/RowType'
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
	const { addToRow, removeFromContainer, clearPreview } = useGameContext()
	const previewedCard = player.preview

	const row = player.rows[rowType]

	const canAdd = previewedCard && previewedCard?.type === rowType && player.id === getCurrentPlayerId()

	const addCardToRow = () => {
		if (canAdd) {
			addToRow(player.id, previewedCard, rowType)
			removeFromContainer(player.id, [previewedCard], 'hand')

			// Clear the preview
			clearPreview(player.id)
		}
	}

	return (
		<div className={cn('flex grow items-center', className)} style={style}>
			<button className='flex aspect-square h-full w-auto cursor-auto items-center justify-center bg-stone-800'>
				SLOT
			</button>
			<button
				className={cn(
					'h-full w-full grow cursor-auto bg-stone-700',
					canAdd && 'cursor-pointer ring-4 ring-inset ring-yellow-600'
				)}
				onClick={() => {
					addCardToRow()
				}}>
				<Cards cards={row.cards} />
			</button>
		</div>
	)
}
