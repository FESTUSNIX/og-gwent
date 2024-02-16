'use client'

import { Hand } from '@/app/play/[room]/components/GameBoard/components/Hand'
import { BackgroundMusic } from '@/components/BackgroundMusic'
import { CardsPreview } from '@/components/CardsPreview'
import { getRandomItemBasedOnCode } from '@/lib/utils'
import { WeatherEffect } from '@/types/WeatherEffect'
import { Tables } from '@/types/supabase'
import { useEffect, useState } from 'react'
import { useNoticeContext } from '../../context/NoticeContext'
import useGameContext from '../../hooks/useGameContext'
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
	const { notice } = useNoticeContext()

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

	if (!host || !opponent) return null
	if (gameState.players.filter(p => p?.gameStatus === 'select-deck').length >= 1) return null

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
							className='absolute right-0 top-1/2 z-20 flex w-72 max-w-[80vw] grow -translate-y-1/2 items-center justify-center @6xl:relative @6xl:top-0 @6xl:w-full @6xl:translate-y-0'></div>

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
