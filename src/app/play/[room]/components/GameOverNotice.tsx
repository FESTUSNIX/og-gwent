'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogOverlay, DialogPortal } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { GameState } from '@/types/Game'
import { DialogContent } from '@radix-ui/react-dialog'
import Image from 'next/image'
import { useNoticeContext } from '../context/NoticeContext'
import DrawImg from '/public/game/icons/end_draw.png'
import LoseImg from '/public/game/icons/end_lose.png'
import WinImg from '/public/game/icons/end_win.png'

type Props = {
	gameResult: 'win' | 'lose' | 'draw'
	rounds: GameState['rounds']
	players: GameState['players']
}

export const GameOverNotice = ({ gameResult, rounds, players }: Props) => {
	const { noticeState, closeNotice } = useNoticeContext()
	const { show } = noticeState

	const IMAGE_ENUM = {
		win: WinImg,
		draw: DrawImg,
		lose: LoseImg
	}

	return (
		<Dialog
			open={show}
			onOpenChange={open => {
				if (!open) closeNotice()
			}}>
			<DialogPortal>
				<DialogOverlay className='bg-black/95' />
				<DialogContent className='z-50'>
					<div
						className={cn(
							'fixed left-[50%] top-[50%] z-50 flex w-auto translate-x-[-50%] translate-y-[-50%] items-center justify-center border-none'
						)}>
						<div className='grid grid-cols-[min-content] gap-y-16'>
							<div className='pointer-events-none relative h-auto w-full min-w-80 max-w-full select-none'>
								<div className='absolute bottom-0 left-1/2 -z-10 aspect-square h-auto w-full -translate-x-1/2 rounded-full bg-primary/30 blur-[140px]' />
								<Image src={IMAGE_ENUM[gameResult]} alt='' className='h-auto w-full object-contain' />
							</div>

							<div
								className='relative grid gap-x-36 gap-y-10 px-12'
								style={{
									gridTemplateColumns: `repeat(${rounds.length}, auto`,
									gridTemplateRows: `repeat(${players.length + 1}, auto`
								}}>
								<div className='col-span-full grid grid-cols-subgrid'>
									{rounds.map((round, i) => (
										<div key={`round-${i}`} className='w-max'>
											<h3 className='text-base text-muted-foreground'>Round {i + 1}</h3>
										</div>
									))}
								</div>

								{players
									.sort((a, b) => (a.id === '1' ? -1 : 1))
									.map(player => (
										<div key={player.id} className='relative col-span-full grid grid-cols-subgrid'>
											<h4 className='absolute -left-36 -translate-x-full text-end text-lg text-primary'>
												{player.name}
											</h4>

											{rounds.map((round, i) => {
												const roundPlayer = round.players.find(p => p.id === player.id)
												if (!roundPlayer) return

												return (
													<h4
														key={`round-${i}`}
														className={cn(
															'text-center text-2xl',
															roundPlayer.score === Math.max(...round.players.map(p => p.score))
																? 'text-primary'
																: 'text-foreground'
														)}>
														{round.players.find(p => p.id === player.id)?.score}
													</h4>
												)
											})}
										</div>
									))}
							</div>
						</div>
					</div>

					<DialogClose asChild>
						<Button variant={'secondary'} size={'sm'} className='fixed bottom-10 right-8 z-10'>
							Close
						</Button>
					</DialogClose>
				</DialogContent>
			</DialogPortal>
		</Dialog>
	)
}
