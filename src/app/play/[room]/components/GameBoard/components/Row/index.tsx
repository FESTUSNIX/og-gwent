import useGameContext from '@/app/play/[room]/hooks/useGameContext'
import { Card } from '@/components/Card'
import { calculateCardScore, calculateRowScore } from '@/lib/calculateScores'
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
		sync,
		actions: {
			addToRow,
			removeFromContainer,
			clearPreview,
			setTurn,
			setRowEffect,
			updatePlayerState,
			removeFromRow,
			addToContainer
		}
	} = useGameContext()
	const cardToAdd = player.preview

	const row = player.rows[rowType]
	const opponent = gameState.players.find(p => p.id !== player.id)!

	const canPlay = side === 'host' && !player.hasPassed

	const canAddUnit =
		(cardToAdd?.type === 'unit' || cardToAdd?.type === 'hero') &&
		((cardToAdd?.row === 'agile' && ['melee', 'range'].includes(rowType)) || cardToAdd?.row === rowType) &&
		canPlay

	const isDecoy = cardToAdd?.ability === 'decoy'
	const canAddDecoy = isDecoy && row.cards.find(c => c.type === 'unit') && canPlay
	const canScorch = cardToAdd?.ability === 'scorch' && canPlay

	const cleanAfterPlay = (card?: CardType) => {
		if (card) removeFromContainer(player.id, [card], 'hand')

		clearPreview(player.id)

		if (!opponent.hasPassed) {
			setTurn(gameState.turn === player.id ? opponent.id : gameState.turn)
		}

		sync()
	}

	const handleCardPlace = () => {
		if (isDecoy) return
		if (canAddUnit) return handleCardAdd()
		if (canScorch) return handleScorch()
	}

	const handleCardAdd = () => {
		if (!canAddUnit) return
		if (cardToAdd.ability === 'scorch') return handleScorch()

		addToRow(player.id, cardToAdd, rowType)
		cleanAfterPlay(cardToAdd)
	}

	const canAddEffect =
		cardToAdd?.row === 'effect' &&
		['horn', 'mardroeme', null].includes(cardToAdd.ability ?? null) &&
		!row.effect &&
		canPlay

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

	const handleScorch = () => {
		const card = side === 'host' ? cardToAdd : opponent.preview

		if (!(card?.ability === 'scorch' && (!card.row || card.row === rowType))) return

		// TODO: Refractor
		const allRows = gameState.players.flatMap(p => {
			return Object.entries(p.rows)
				.filter(([key, value]) => (!card.row ? true : key === card.row && p.id !== player.id))
				.map(([key, value]) => ({ ...value, owner: p.id, rowType: key as BoardRowTypes }))
		})

		const cardsWithDetails = allRows
			.flatMap(r =>
				r.cards.map(c => ({
					id: c.id,
					type: c.type,
					strength: calculateCardScore(c, r),
					row: r.rowType,
					owner: r.owner
				}))
			)
			.filter(c => c.type === 'unit')

		const rowsTotalScore = allRows
			.flatMap(r => r.cards.map(c => ({ strength: calculateCardScore(c, r) })))
			.reduce((prev, curr) => prev + (curr.strength ?? 0), 0)

		if (card.row && rowsTotalScore < 10) {
			addToRow(player.id, card, card.row)
			cleanAfterPlay(card)
			return
		}

		const highestStrength = cardsWithDetails.reduce((prev, curr) =>
			(curr.strength ?? 0) > (prev.strength ?? 0) ? curr : prev
		).strength

		cardsWithDetails
			.filter(c => c.strength === highestStrength)
			.map(card => {
				const gameCard = allRows.flatMap(r => r.cards).find(c => c.id === card.id)

				if (!gameCard) return

				removeFromRow(card.owner, [gameCard], card.row)
				addToContainer(card.owner, [gameCard], 'discardPile')

				return gameCard
			})

		card.row ? addToRow(player.id, card, card.row) : addToContainer(player.id, [card], 'discardPile')

		cleanAfterPlay(card)
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
					(canAddUnit || canAddDecoy) && 'cursor-pointer ring-4 ring-inset ring-yellow-600/50 hover:ring-yellow-600'
				)}
				onClick={() => {
					handleCardPlace()
				}}>
				<Cards cards={row.cards} row={row} previewCard={cardToAdd} handleDecoy={handleDecoy} />
			</button>
		</div>
	)
}
