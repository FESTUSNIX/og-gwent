import useGameContext from '@/app/play/[room]/hooks/useGameContext'
import { Card } from '@/components/Card'
import { calculateCardStrength, calculateRowScore } from '@/lib/calculateScores'
import { cn, getRandomEntries } from '@/lib/utils'
import { CardType } from '@/types/Card'
import { GamePlayer } from '@/types/Game'
import { BoardRowTypes } from '@/types/RowType'
import { ArrowBigUpDash } from 'lucide-react'
import { CSSProperties } from 'react'
import { Cards } from './components/Cards'

type Props = {
	rowType: BoardRowTypes
	host: GamePlayer
	opponent: GamePlayer
	side: 'host' | 'opponent'
	className?: string
	style?: CSSProperties
}

export const Row = ({ rowType, side, host, opponent, className, style }: Props) => {
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

	const player = side === 'host' ? host : opponent

	const cardToAdd = host.preview
	const row = player.rows[rowType]

	const canPlay = side === 'host' && !host.hasPassed
	const isCorrectRow =
		(cardToAdd?.row === 'agile' && ['melee', 'range'].includes(rowType)) || cardToAdd?.row === rowType

	const canPlayUnit = (cardToAdd?.type === 'unit' || cardToAdd?.type === 'hero') && isCorrectRow && canPlay
	const canPlayDecoy = cardToAdd?.ability === 'decoy' && row.cards.find(c => c.type === 'unit') && canPlay
	const canScorch = cardToAdd?.ability === 'scorch' && canPlay
	const canPlaySpy = cardToAdd?.ability === 'spy' && side === 'opponent' && isCorrectRow && !host.hasPassed

	const cleanAfterPlay = (card?: CardType) => {
		if (card) removeFromContainer(host.id, [card], 'hand')

		clearPreview(host.id)

		if (!opponent.hasPassed) {
			setTurn(gameState.turn === host.id ? opponent.id : gameState.turn)
		}

		sync()
	}

	const handleCardPlace = () => {
		if (cardToAdd?.ability === 'decoy') return
		if (canPlaySpy) return handleSpy()
		if (canPlayUnit) return handleUnitAdd()
		if (canScorch) return handleScorch()
	}

	const handleUnitAdd = () => {
		if (!canPlayUnit) return
		if (cardToAdd.ability === 'scorch') return handleScorch()

		addToRow(host.id, cardToAdd, rowType)
		cleanAfterPlay(cardToAdd)
	}

	const canPlayEffect =
		cardToAdd?.row === 'effect' &&
		['horn', 'mardroeme', null].includes(cardToAdd.ability ?? null) &&
		!row.effect &&
		canPlay

	const handleEffectAdd = () => {
		if (!canPlayEffect) return

		setRowEffect(host.id, cardToAdd, rowType)
		cleanAfterPlay(cardToAdd)
	}

	const handleDecoy = (card: CardType) => {
		if (cardToAdd?.ability !== 'decoy' || card.type !== 'unit') return

		updatePlayerState(host.id, {
			rows: {
				...host.rows,
				[rowType]: {
					...row,
					cards: [...row.cards.filter(c => c.id !== card.id), cardToAdd]
				}
			},
			hand: [...host.hand.filter(c => c.id !== cardToAdd.id), card]
		})
		cleanAfterPlay()
	}

	const handleScorch = () => {
		const card = side === 'host' ? cardToAdd : opponent.preview

		if (!(card?.ability === 'scorch' && (!card.row || card.row === rowType))) return

		// TODO: Refractor
		const allRows = gameState.players.flatMap(p => {
			return Object.entries(p.rows)
				.filter(([key, value]) => (!card.row ? true : key === card.row && p.id !== host.id))
				.map(([key, value]) => ({ ...value, owner: p.id, rowType: key as BoardRowTypes }))
		})

		const cardsWithDetails = allRows
			.flatMap(r =>
				r.cards.map(c => ({
					id: c.id,
					type: c.type,
					strength: calculateCardStrength(c, r),
					row: r.rowType,
					owner: r.owner
				}))
			)
			.filter(c => c.type === 'unit')

		const rowsTotalScore = allRows
			.flatMap(r => r.cards.map(c => ({ strength: calculateCardStrength(c, r) })))
			.reduce((prev, curr) => prev + (curr.strength ?? 0), 0)

		if (card.row && rowsTotalScore < 10) {
			addToRow(host.id, card, card.row)
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

		card.row ? addToRow(host.id, card, card.row) : addToContainer(host.id, [card], 'discardPile')

		cleanAfterPlay(card)
	}

	const handleSpy = () => {
		if (cardToAdd?.ability !== 'spy') return

		addToRow(opponent.id, cardToAdd, rowType)

		const cards = getRandomEntries(host.deck, 2)

		addToContainer(host.id, cards, 'hand')
		removeFromContainer(host.id, cards, 'deck')

		cleanAfterPlay(cardToAdd)
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
					canPlayEffect && 'cursor-pointer ring-4 ring-inset ring-yellow-600/50 hover:ring-yellow-600'
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
					((canPlayUnit && cardToAdd.ability !== 'spy') || canPlayDecoy || canPlaySpy) &&
						'cursor-pointer ring-4 ring-inset ring-yellow-600/50 hover:ring-yellow-600'
				)}
				onClick={() => {
					handleCardPlace()
				}}>
				<Cards cards={row.cards} row={row} previewCard={cardToAdd} handleDecoy={handleDecoy} />
			</button>
		</div>
	)
}
