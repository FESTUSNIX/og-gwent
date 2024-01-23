import useGameContext from '@/app/play/[room]/hooks/useGameContext'
import { Card } from '@/components/Card'
import { calculateRowScore } from '@/lib/calculateScores'
import { cn } from '@/lib/utils'
import { CardType } from '@/types/Card'
import { GamePlayer } from '@/types/Game'
import { BoardRowTypes } from '@/types/RowType'
import { ArrowBigUpDash } from 'lucide-react'
import { CSSProperties } from 'react'
import { Cards } from './components/Cards'

type Props = {
	rowType: BoardRowTypes
	player: GamePlayer
	side: 'host' | 'opponent'
	className?: string
	style?: CSSProperties
}

export const Row = ({ rowType, player, side, className, style }: Props) => {
	const {
		gameState,
		addToRow,
		removeFromContainer,
		clearPreview,
		setTurn,
		setRowEffect,
		updatePlayerState
	} = useGameContext()
	const cardToAdd = player.preview

	const row = player.rows[rowType]
	const opponent = gameState.players.find(p => p.id !== player.id)!

	const cleanAfterPlay = (card?: CardType) => {
		card && removeFromContainer(player.id, [card], 'hand')
		clearPreview(player.id)

		if (opponent.hasPassed) return
		setTurn(gameState.turn === player.id ? opponent.id : gameState.turn)
	}

	const canAdd =
		cardToAdd &&
		((cardToAdd?.row === 'agile' && ['melee', 'range'].includes(rowType)) || cardToAdd?.row === rowType) &&
		side === 'host' &&
		!player.hasPassed

	const isDecoy = cardToAdd?.ability === 'decoy'
	const canAddDecoy = isDecoy && row.cards.find(c => c.type === 'unit') && side === 'host' && !player.hasPassed

	const handleCardAdd = () => {
		if (!canAdd) return
		if (isDecoy) return

		addToRow(player.id, cardToAdd, rowType)
		cleanAfterPlay(cardToAdd)
	}

	const canAddEffect =
		cardToAdd?.row === 'effect' &&
		['horn', 'mardroeme', null].includes(cardToAdd.ability ?? null) &&
		!row.effect &&
		side === 'host' &&
		!player.hasPassed

	const handleEffectAdd = () => {
		if (!canAddEffect) return

		setRowEffect(player.id, cardToAdd, rowType)
		cleanAfterPlay(cardToAdd)
	}

	const handleDecoy = (card: CardType) => {
		if (cardToAdd?.ability !== 'decoy' || card.type !== 'unit') return

		const rowToUpdate = player.rows[rowType]

		updatePlayerState(player.id, {
			rows: {
				...player.rows,
				[rowType]: {
					...rowToUpdate,
					cards: [...rowToUpdate.cards.filter(c => c.id !== card.id), cardToAdd]
				}
			},
			hand: [...player.hand.filter(c => c.id !== cardToAdd.id), card]
		})
		cleanAfterPlay()
	}

	return (
		<div className={cn('relative flex grow items-center', className)} style={style}>
			<div className='absolute left-0 flex h-full -translate-x-full items-center'>
				<div
					className={cn(
						'z-10 -mr-1.5 flex aspect-square h-12 w-12 translate-x-0.5 items-center justify-center rounded-full border-[3px] border-neutral-500 text-black',
						side === 'host' ? 'bg-orange-300' : 'bg-blue-300'
					)}>
					<span className='text-2xl'>{calculateRowScore(row)}</span>
				</div>
				<div className='h-full w-3 rounded-l-md bg-neutral-500' />
			</div>
			<button
				className={cn(
					'flex aspect-square h-full w-auto cursor-auto items-center justify-center bg-stone-800 duration-100',
					canAddEffect && 'cursor-pointer ring-4 ring-inset ring-yellow-600/50 hover:ring-yellow-600'
				)}
				onClick={() => {
					handleEffectAdd()
				}}>
				<ArrowBigUpDash className='absolute h-20 w-20 text-white/5' />
				{row.effect && <Card card={row.effect} mode='game' row={row} />}
			</button>
			<button
				className={cn(
					'relative h-full w-full grow cursor-auto bg-stone-700 duration-100',
					(canAdd || canAddDecoy) && 'cursor-pointer ring-4 ring-inset ring-yellow-600/50 hover:ring-yellow-600'
				)}
				onClick={() => {
					handleCardAdd()
				}}>
				<Cards cards={row.cards} row={row} previewCard={cardToAdd} handleDecoy={handleDecoy} />
			</button>
		</div>
	)
}
