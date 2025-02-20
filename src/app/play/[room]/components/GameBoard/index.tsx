'use client'

import { Hand } from '@/app/play/[room]/components/GameBoard/components/Hand'
import { BackgroundMusic } from '@/components/BackgroundMusic'
import { Card } from '@/components/Card'
import { CardsPreview } from '@/components/CardsPreview'
import { delay, getRandomItemBasedOnCode } from '@/lib/utils'
import { CardType } from '@/types/Card'
import { WeatherEffect } from '@/types/WeatherEffect'
import { Tables } from '@/types/supabase'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { AnimatedCardType, useAnimatedCards } from '../../context/AnimatedCardsContext'
import { useNoticeContext } from '../../context/NoticeContext'
import useGameContext from '../../hooks/useGameContext'
import usePrevious from '../../hooks/usePrevious'
import { CardPiles } from './components/CardPiles'
import { ChooseTurnDialog } from './components/ChooseTurnDialog'
import { Reroll } from './components/Reroll'
import { Side } from './components/Side'
import { Sidebar } from './components/Sidebar'
import { WaitForStartBanner } from './components/WaitForStartBanner'

type Props = {
	user: Pick<Tables<'profiles'>, 'id' | 'username'>
	roomId: string
}

export const GameBoard = ({ user, roomId }: Props) => {
	const {
		gameState,
		sync,
		actions: { setTurn }
	} = useGameContext()
	const { notice, isResolving } = useNoticeContext()

	const host = gameState.players.find(p => p?.id === user.id)
	const opponent = gameState.players.find(p => p?.id !== user.id)

	const [showReroll, setShowReroll] = useState(false)
	const [showChooseTurnDialog, setShowChooseTurnDialog] = useState(false)

	const handleTurnChoose = async (player: 'opponent' | 'host') => {
		setTurn(player === 'host' ? host?.id ?? null : opponent?.id ?? null)

		sync()
		setShowChooseTurnDialog(false)

		await notice({
			title: player === 'host' ? 'You will go first' : 'Your opponent will go first',
			image: `/game/icons/notice/coin_host.png`
		})

		setShowReroll(true)
	}

	const selectFirstTurn = async () => {
		if (host?.faction === 'scoiatael' && opponent?.faction !== 'scoiatael') {
			return setShowChooseTurnDialog(true)
		}
		if (opponent?.faction === 'scoiatael' && host?.faction !== 'scoiatael') {
			await notice({
				title: 'Your opponent is playing Scoiatael faction, they will choose who goes first',
				image: '/game/icons/notice/scoiatael.png'
			})
			return
		}

		const randomCode = `${gameState.roomOwner}-${roomId}`
		const startingPlayer = getRandomItemBasedOnCode(gameState.players, randomCode)

		setTurn(startingPlayer?.id)

		await notice({
			title: startingPlayer?.id === user.id ? 'You will go first' : 'Your opponent will go first',
			image: `/game/icons/notice/coin_${startingPlayer?.id === user.id ? 'host' : 'opponent'}.png`
		})

		setShowReroll(true)
	}

	useEffect(() => {
		if (gameState.players.filter(p => p?.gameStatus === 'select-deck').length >= 1) return

		if (host?.gameStatus === 'accepted' && opponent?.gameStatus === 'accepted' && !gameState.turn) selectFirstTurn()
		if (host?.gameStatus === 'play') setShowReroll(false)

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [host?.gameStatus, opponent?.gameStatus])

	useEffect(() => {
		const displayTurnNotice = async () => {
			await notice({
				title:
					gameState.turn === opponent?.id
						? "Opponent used the Scoia'tael faction perk to go first."
						: "Opponent used the Scoia'tael faction perk, you will go first.",
				image: '/game/icons/notice/scoiatael.png'
			})

			setShowReroll(true)
		}

		if (
			opponent &&
			host &&
			opponent.faction === 'scoiatael' &&
			host.faction !== 'scoiatael' &&
			host.gameStatus === 'accepted'
		) {
			displayTurnNotice()
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [gameState.turn])

	// CARD ANIMATIONS ===================================================

	const { animatedCards, setAnimatedCards } = useAnimatedCards()

	const allRowCards = useMemo(() => {
		const allCards: (CardType & { side: string })[] = []

		gameState.players.forEach(player => {
			if (!player) return

			Object.values(player.rows).forEach(row => {
				allCards.push(...row.cards.map(card => ({ ...card, side: player.id === user.id ? 'host' : 'opponent' })))
			})
		})

		return allCards
	}, [gameState.players])

	const previousCards = usePrevious(allRowCards)
	const previousDiscardPile = usePrevious(opponent?.discardPile)
	const previousOpponentHand = usePrevious(opponent?.hand)
	const previousOpponentDeck = usePrevious(opponent?.deck)

	const shouldAnimateToPreview = (card: AnimatedCardType) => {
		return (
			![...(previousDiscardPile ?? []), ...(previousOpponentDeck ?? [])]?.some(c => card.instance === c.instance) &&
			!card.ignorePreview
		)
	}

	const animateCards = async (cards: CardType[]) => {
		if (cards.length === 0) return

		setAnimatedCards(cards)

		await delay(shouldAnimateToPreview(cards[0]) ? 2000 : 500)

		const [firstCard, ...remainingCards] = cards

		if (remainingCards.length === 0) {
			return setAnimatedCards([])
		}

		animateCards(remainingCards)
	}

	useEffect(() => {
		const handleAnimation = async () => {
			if (!opponent?.hand || !previousOpponentHand) return

			const newCards = allRowCards.filter(card => !previousCards?.find(prevCard => prevCard.instance === card.instance))

			if (previousOpponentHand?.length === opponent?.hand.length && !newCards.some(card => card.ability === 'decoy')) {
				return
			}

			let filteredNewCards: CardType[] = []

			filteredNewCards = newCards
				.filter(
					card =>
						(card.side === 'opponent' && card.ability !== 'spy') || (card.side === 'host' && card.ability === 'spy')
				)
				.toReversed()
				.sort((a, b) => (a.ability === 'medic' ? -1 : b.ability === 'medic' ? 1 : 0))

			// If theres multiple "muster" cards we want to animate in only the first one
			const musterCards = filteredNewCards.filter(card => card.ability === 'muster')
			if (musterCards.length > 1) {
				filteredNewCards = filteredNewCards.filter(card => card.ability !== 'muster')
				filteredNewCards.push(
					...[
						musterCards[musterCards.length - 1],
						...musterCards.slice(0, musterCards.length - 1).map(card => ({ ...card, ignorePreview: true }))
					]
				)
			}

			if (filteredNewCards.length > 0) {
				await animateCards(filteredNewCards)

				if (!gameState.players.some(p => p?.hasPassed) && gameState.turn === user.id && !isResolving) {
					await delay(2000)
					await notice({
						title: 'Your turn',
						image: '/game/icons/notice/turn_host.png'
					})
				}
			}
		}

		handleAnimation()

		return () => {
			setAnimatedCards([])
		}
	}, [allRowCards])

	if (!host || !opponent) return null
	if (gameState.players.filter(p => p?.gameStatus === 'select-deck').length >= 1) return null

	const cardsToAnimate = animatedCards.filter(animatedCard => shouldAnimateToPreview(animatedCard))

	return (
		<main className='relative z-10 flex h-full w-full grow flex-col overflow-hidden bg-black'>
			<div className='relative mx-auto my-auto grid max-h-[980px] w-full max-w-[1780px] grow grid-cols-[375px_1fr]'>
				<ChooseTurnDialog
					isOpen={showChooseTurnDialog}
					setIsOpen={setShowChooseTurnDialog}
					handleTurnChoose={handleTurnChoose}
				/>
				{host && showReroll && host.gameStatus === 'accepted' && <Reroll host={host} opponent={opponent} />}
				{host.gameStatus === 'play' && opponent.gameStatus === 'accepted' && <WaitForStartBanner />}

				<Sidebar
					host={host}
					opponent={opponent}
					turn={gameState.turn}
					weatherEffects={gameState.weatherEffects?.map(effect => effect.ability as WeatherEffect)}
				/>

				<div className='relative flex h-full min-w-0 bg-black pb-12 pl-28 pt-2 @container'>
					<div className='z-10 flex h-full min-w-0 grow flex-col'>
						<div className='relative flex h-full flex-col gap-y-2 pt-2'>
							<CardsPreview>
								<Side host={host} opponent={opponent} side='opponent' />

								<div className='pointer-events-none z-0 my-1.5 -ml-8 h-2 w-[calc(100%+2rem)] bg-[url("/game/board/rows_separator.png")] bg-center [background-size:100%_100%]' />

								<Side host={host} opponent={opponent} side='host' />
							</CardsPreview>

							<Hand player={host} />
						</div>
					</div>

					<div className='z-10 flex h-full min-w-max flex-col items-center justify-between gap-y-4 pl-6 pr-4 pt-8'>
						<CardPiles player={opponent} side='opponent' />

						<div
							id='card-preview-container'
							className='absolute right-0 top-1/2 z-20 flex w-72 max-w-[80vw] grow -translate-y-1/2 items-center justify-center @6xl:relative @6xl:top-0 @6xl:w-full @6xl:translate-y-0'>
							{cardsToAnimate.length > 0 && (
								<motion.div
									key={cardsToAnimate[0].instance}
									initial={{ y: -1000, x: -500 }}
									animate={{ y: 0, x: 0 }}
									transition={{ duration: 0.6, ease: 'easeInOut', type: 'tween' }}
									className='absolute z-30 h-auto w-full py-6'>
									<Card card={animatedCards[0]} mode='preview' useLayoutAnimation />
								</motion.div>
							)}
						</div>

						<CardPiles player={host} side='host' />
					</div>

					<div className='pointer-events-none absolute inset-0 z-0 h-full w-full bg-[url("/game/board/background.png")] bg-cover bg-left' />
				</div>

				<BackgroundMusic />

				<div className='pointer-events-none absolute left-0 top-0 z-0 h-full w-20 -translate-x-1/2 bg-gradient-to-r from-black from-50% to-black/0' />
				<div className='pointer-events-none absolute right-0 top-0 z-0 h-full w-20 translate-x-1/2 bg-gradient-to-l from-black from-50% to-black/0' />

				<div className='pointer-events-none absolute top-0 z-0 h-10 w-full -translate-y-1/2 bg-gradient-to-b from-black from-50% to-black/0' />
				<div className='pointer-events-none absolute bottom-0 z-0 h-10 w-full translate-y-1/2 bg-gradient-to-t from-black from-50% to-black/0' />
			</div>
		</main>
	)
}
