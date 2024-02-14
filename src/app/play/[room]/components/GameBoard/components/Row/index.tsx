import useGameContext from '@/app/play/[room]/hooks/useGameContext'
import { Card } from '@/components/Card'
import { useCardsPreview } from '@/components/CardsPreview'
import { calculateCardStrength, calculateRowScore } from '@/lib/calculateScores'
import { cn, getRandomEntries } from '@/lib/utils'
import { CardType } from '@/types/Card'
import { GamePlayer } from '@/types/Game'
import { BoardRowTypes } from '@/types/RowType'
import { ROW_TO_WEATHER_EFFECT, WeatherEffect } from '@/types/WeatherEffect'
import Image from 'next/image'
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
	const { openPreview } = useCardsPreview()

	const player = side === 'host' ? host : opponent

	const weatherEffect = gameState.weatherEffects?.find(e => e.ability === ROW_TO_WEATHER_EFFECT[rowType])
		?.ability as WeatherEffect

	const cardToAdd = host.preview
	const row = player.rows[rowType]

	const canPlay = side === 'host' && !host.hasPassed

	const isCorrectRow = (card: CardType | null = cardToAdd, _rowType: BoardRowTypes = rowType) => {
		return (card?.row === 'agile' && ['melee', 'range'].includes(_rowType)) || card?.row === _rowType
	}
	const canPlayUnit = (card: CardType | null = cardToAdd, _rowType: BoardRowTypes = rowType) => {
		return (
			(card?.type === 'unit' || card?.type === 'hero') &&
			isCorrectRow(card, _rowType) &&
			canPlay &&
			card.ability !== 'spy'
		)
	}
	const canScorch = (card: CardType | null = cardToAdd) => card?.ability === 'scorch' && canPlay
	const canPlaySpy = (
		card: CardType | null = cardToAdd,
		_rowType: BoardRowTypes = rowType,
		_side: 'host' | 'opponent' = side
	) => {
		return card?.ability === 'spy' && _side === 'opponent' && isCorrectRow(card, _rowType) && !host.hasPassed
	}
	const canPlayMedic = (card: CardType | null = cardToAdd, _rowType: BoardRowTypes = rowType) => {
		return card?.ability === 'medic' && canPlayUnit(card, _rowType)
	}
	const canPlayMuster = (card: CardType | null = cardToAdd, _rowType: BoardRowTypes = rowType) => {
		return (card?.ability ?? '').split('-')[0] === 'muster' && canPlayUnit(card, _rowType)
	}

	const canPlayDecoy = cardToAdd?.ability === 'decoy' && row.cards.find(c => c.type === 'unit') && canPlay
	const canPlayEffect =
		cardToAdd?.row === 'effect' &&
		['horn', 'mardroeme', null].includes(cardToAdd.ability ?? null) &&
		!row.effect &&
		canPlay

	const canAddToRow = (canPlayUnit() && cardToAdd?.ability !== 'spy') || canPlayDecoy || canPlaySpy()

	const cleanAfterPlay = (card?: CardType) => {
		if (card) removeFromContainer(host.id, [card], 'hand')

		clearPreview(host.id)

		if (!opponent.hasPassed) {
			setTurn(gameState.turn === host.id ? opponent.id : gameState.turn)
		}

		sync()
	}

	const handleCardPlay = (card: CardType, _rowType: BoardRowTypes = rowType, _side: 'host' | 'opponent' = side) => {
		if (card?.ability === 'decoy') return
		if (canPlaySpy(card, _rowType, _side)) return handleSpy(card, _rowType)
		if (canPlayMedic(card, _rowType)) return handleMedic(card, _rowType)
		if (canPlayMuster(card, _rowType)) return handleMuster(card, _rowType)
		if (canScorch(card)) return handleScorch(card, _rowType)
		if (canPlayUnit(card, _rowType)) return handleUnitAdd(card, _rowType)
	}

	const handleUnitAdd = (card: CardType, rowType: BoardRowTypes) => {
		if (!canPlayUnit) return

		addToRow(host.id, card, rowType)
		cleanAfterPlay(card)
	}

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
					cards: [...row.cards.filter(c => c.instance !== card.instance), cardToAdd]
				}
			},
			hand: [...host.hand.filter(c => c.instance !== cardToAdd.instance), card]
		})
		cleanAfterPlay()
	}

	const handleScorch = (card: CardType, rowType: BoardRowTypes) => {
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
					instance: c.instance,
					type: c.type,
					strength: calculateCardStrength(c, r, weatherEffect),
					row: r.rowType,
					owner: r.owner
				}))
			)
			.filter(c => c.type === 'unit')

		const rowsTotalScore = allRows
			.flatMap(r => r.cards.map(c => ({ strength: calculateCardStrength(c, r, weatherEffect) })))
			.reduce((prev, curr) => prev + (curr.strength ?? 0), 0)

		if (card.row && (rowsTotalScore < 10 || cardsWithDetails.length === 0)) {
			addToRow(host.id, card, card.row)
			cleanAfterPlay(card)
			return
		}
		if (!card.row && cardsWithDetails.length === 0) {
			addToContainer(host.id, [card], 'discardPile')
			cleanAfterPlay(card)
			return
		}

		const highestStrength = cardsWithDetails.reduce((prev, curr) =>
			(curr.strength ?? 0) > (prev.strength ?? 0) ? curr : prev
		).strength

		cardsWithDetails
			.filter(c => c.strength === highestStrength)
			.map(card => {
				const gameCard = allRows.flatMap(r => r.cards).find(c => c.instance === card.instance)

				if (!gameCard) return

				removeFromRow(card.owner, [gameCard], card.row)
				addToContainer(card.owner, [gameCard], 'discardPile')

				return gameCard
			})

		card.row ? addToRow(host.id, card, card.row) : addToContainer(host.id, [card], 'discardPile')

		cleanAfterPlay(card)
	}

	const handleSpy = (card: CardType, rowType: BoardRowTypes) => {
		if (card?.ability !== 'spy') return

		addToRow(opponent.id, card, rowType)

		const cards = getRandomEntries(host.deck, 2)

		addToContainer(host.id, cards, 'hand')
		removeFromContainer(host.id, cards, 'deck')

		cleanAfterPlay(card)
	}

	const handleMedic = (card: CardType, rowType: BoardRowTypes) => {
		if (card?.ability !== 'medic') return

		const cards = host.discardPile.filter(c => c.type === 'unit' && c.instance !== card.instance)

		let cardToRevive: CardType | undefined

		addToRow(host.id, card, rowType)

		if (cards.length === 0) {
			return cleanAfterPlay(card)
		} else {
			removeFromContainer(host.id, [card], 'hand')
		}

		openPreview({
			cards: cards.toReversed(),
			onCardSelect: card => {
				cardToRevive = card
			},
			onClose: () => {
				if (!cardToRevive) cardToRevive = getRandomEntries(cards, 1)[0]

				const reviveToRow = cardToRevive.row === 'agile' ? getRandomEntries(['melee', 'range'], 1)[0] : cardToRevive.row

				if (!reviveToRow) return

				removeFromContainer(host.id, [cardToRevive], 'discardPile')

				handleCardPlay(cardToRevive, reviveToRow as BoardRowTypes, cardToRevive.ability === 'spy' ? 'opponent' : 'host')
			}
		})
	}

	const handleMuster = (card: CardType, rowType: BoardRowTypes) => {
		if ((card?.ability ?? '').split('-')[0] !== 'muster') return

		const isMuster = (c: CardType) =>
			c.ability !== 'muster-summoner' && c.instance !== card.instance && c.group === card.group

		const handMusterCards = host.hand.filter(c => isMuster(c))
		const deckMusterCards = host.deck.filter(c => isMuster(c))

		addToRow(host.id, card, rowType)
		removeFromContainer(host.id, [card], 'hand')

		handMusterCards.map(c => {
			addToRow(host.id, c, c.row as BoardRowTypes)
			removeFromContainer(host.id, [c], 'hand')
		})
		deckMusterCards.map(c => {
			addToRow(host.id, c, c.row as BoardRowTypes)
			removeFromContainer(host.id, [c], 'deck')
		})

		cleanAfterPlay()
	}

	return (
		<div className={cn('relative z-10 flex h-[calc(100%/7)] grow items-center', className)} style={style}>
			<div className='absolute left-0 z-10 flex h-full translate-x-[calc(-100%+4px)] items-center'>
				<div
					className={cn(
						'z-10 -mr-1.5 flex aspect-square h-12 w-12 translate-x-0.5 items-center justify-center text-black'
					)}>
					<span className='z-10 text-2xl [text-shadow:0_0_4px_#fff,0_0_2px_#fff,0_0_6px_#fff]'>
						{calculateRowScore(row, weatherEffect)}
					</span>
					<div
						className='absolute z-0 h-full w-full bg-cover bg-no-repeat'
						style={{ backgroundImage: `url('/game/board/row_score_${side}.png')` }}
					/>
				</div>
				<div className="aspect-[18/124] h-full w-auto bg-[url('/game/board/row_score_deco.png')] bg-cover bg-no-repeat" />
			</div>
			<button
				className={cn(
					'group relative z-0 mr-px aspect-square h-full w-auto cursor-auto pb-1 duration-100',
					canPlayEffect && 'cursor-pointer'
				)}
				onClick={() => {
					handleEffectAdd()
				}}>
				<div className='flex aspect-square h-full w-auto items-center justify-center'>
					{row.effect && <Card card={row.effect} mode='game' row={row} />}
				</div>

				<div
					className={cn(
						'pointer-events-none absolute inset-0 bg-yellow-600/15 opacity-0 ring-4 ring-inset ring-transparent duration-100',
						(canPlayEffect || !cardToAdd) && 'group-hover:opacity-100 group-hover:ring-yellow-600/75',
						canPlayEffect && 'cursor-pointer opacity-100'
					)}
				/>
				<div
					style={{ backgroundImage: `url("/game/board/row_effect/${side}_${rowType}.png")` }}
					className='absolute inset-0 -z-10 h-full w-full bg-cover bg-center'
				/>
			</button>
			<button
				className={cn(
					'group relative z-0 h-full w-full grow cursor-auto bg-center bg-no-repeat pb-1 ring-4 ring-inset ring-transparent duration-100 [background-size:100%_100%]',
					(canAddToRow || !cardToAdd) &&
						'after:absolute after:inset-0 after:bg-yellow-600/15 after:opacity-0 after:duration-100 hover:ring-yellow-600/75 hover:after:opacity-100',
					canAddToRow && 'cursor-pointer after:opacity-100'
				)}
				onClick={() => {
					cardToAdd && handleCardPlay(cardToAdd)
				}}
				style={{ backgroundImage: `url('/game/board/row/${side}_${rowType}.png` }}>
				<Cards
					cards={row.cards}
					row={row}
					weatherEffect={weatherEffect}
					previewCard={cardToAdd}
					handleDecoy={handleDecoy}
				/>
			</button>

			{weatherEffect && (
				<div className='pointer-events-none absolute top-0 z-10 h-[calc(100%+3px)] w-full'>
					<Image
						src={`/game/weather/${weatherEffect}.png`}
						alt={`${weatherEffect} weather effect`}
						width={1000}
						height={300}
						className='h-full w-full select-none'
					/>
				</div>
			)}
		</div>
	)
}
