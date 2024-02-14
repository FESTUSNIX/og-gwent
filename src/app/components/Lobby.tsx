'use client'

import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { Database, Tables } from '@/types/supabase'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Session } from '@supabase/supabase-js'
import { X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { UserAvatar } from '../../components/UserAvatar'
import { H2 } from '../../components/ui/Typography/H2'
import { Button } from '../../components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip'
import { GameQueue } from './GameQueue'
import { InviteToLobby } from './InviteToLobby'

type Props = {
	session: Session
	user: Pick<Tables<'profiles'>, 'username' | 'avatar_url'> & { id: string }
	roomId: string | null
}

export type LobbyPlayer = {
	id: string
	avatar_url: string | null
	username: string | null
	online_at: string
	accepted: boolean
	kicked?: string[]
	isHost: boolean
}

type LobbyState = {
	players: LobbyPlayer[]
}

export const Lobby = ({ session, user: _user, roomId }: Props) => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const lobbyId = searchParams.get('wr')

	const supabase = createClientComponentClient<Database>()

	const defaultUser: LobbyPlayer = {
		id: _user.id,
		avatar_url: _user.avatar_url,
		username: _user.username,
		online_at: new Date().toISOString(),
		accepted: false,
		isHost: false
	}

	const [isInQueue, setIsInQueue] = useState(false)
	const [user, setUser] = useState<LobbyPlayer>(defaultUser)
	const [roomState, setRoomState] = useState<LobbyState>({
		players: [user]
	})

	const host = roomState?.players.find(p => p.isHost)
	const acceptedPlayers = roomState?.players.filter(p => p.accepted)

	const isInGame = !!roomId

	const createRoom = async () => {
		try {
			if (!lobbyId || isInGame) return

			const { data } = await supabase.from('room_players').select('playerId').eq('playerId', session.user.id).single()

			if (data?.playerId) {
				throw Error('You are already in a room!')
			}

			const { error: createRoomError } = await supabase.from('rooms').insert({
				id: lobbyId,
				roomOwner: session.user.id
			})
			if (createRoomError) throw Error(createRoomError.message)

			return router.push(`/play/${lobbyId}`)
		} catch (error: any) {
			toast.error(error.message ?? error.toString())
		}
	}

	useEffect(() => {
		if (!lobbyId || isInGame || isInQueue) return

		const waitingRoomChannel = supabase.channel(`queue=${lobbyId}`)

		waitingRoomChannel
			.on('presence', { event: 'sync' }, async () => {
				const newState = waitingRoomChannel.presenceState<LobbyPlayer>()
				console.log('sync', newState)

				const players = Object.values(newState).map(presence => presence[0])

				if (players.find(p => p.isHost)?.kicked?.includes(user.id)) {
					waitingRoomChannel.untrack()
					return router.replace('/')
				}

				setRoomState(prevRoomState => ({
					...prevRoomState,
					players: players
				}))

				if (players.filter(p => p.accepted).length === 2) {
					if (host ? user.isHost : players.toSorted()[0].id === user.id) return createRoom()

					return router.push(`/play/${lobbyId}`)
				}
			})
			.subscribe(async status => {
				if (status !== 'SUBSCRIBED' || host?.kicked?.includes(user.id)) return

				const presenceTrackStatus = await waitingRoomChannel.track(user)
			})

		return () => {
			waitingRoomChannel.untrack()
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, lobbyId])

	return (
		<section>
			<div className='mb-4'>
				{lobbyId && host && <H2 className='mb-4'>{host?.username}&apos;s lobby</H2>}
				{!lobbyId && !isInGame && <H2 className='mb-4'>Invite your friends</H2>}
				{isInGame && <H2 className='mb-4'>You are already in a game</H2>}
			</div>

			<div className='mb-12 flex flex-col gap-2'>
				{roomState?.players
					.sort((a, b) => (a.id === lobbyId ? -1 : b.id === lobbyId ? 1 : 0))
					.map(player => (
						<div
							key={player.id}
							className={cn(
								'relative flex gap-4 rounded-md border border-input px-2 py-2',
								player.accepted && 'border-green-600'
							)}>
							<UserAvatar user={player} className='size-14 rounded-md' />
							<div className=''>
								<h3 className='text-lg font-medium leading-tight'>{player?.username}</h3>
								{/* <p className='text-muted-foreground'>n victories</p> */}
							</div>

							{user.isHost && player.id !== user.id && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												onClick={() => {
													setUser(prevUser => ({
														...prevUser,
														kicked: [...(prevUser.kicked ?? []), player.id]
													}))
												}}
												className='my-auto ml-auto rounded-full border border-transparent p-2 duration-300 hover:border-destructive hover:text-destructive'>
												<span className='sr-only'>Remove player</span>
												<X className='size-4' />
											</button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Remove player</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}
						</div>
					))}

				{(!lobbyId || (roomState?.players.length ?? 1) < 2) && (
					<InviteToLobby isInGame={isInGame} lobbyCode={lobbyId} setUser={setUser} />
				)}
			</div>

			<div className=''>
				{roomState.players.length === 2 && !isInGame && (
					<Button
						onClick={() => {
							setUser(prevUser => ({
								...prevUser,
								accepted: !prevUser.accepted
							}))
						}}
						className='w-full rounded-full px-6 py-7 font-normal md:text-lg'>
						{user.accepted ? 'Cancel' : 'Accept game'}
					</Button>
				)}

				{roomState.players.length < 2 && !isInGame && (
					<GameQueue
						isInQueue={isInQueue}
						setIsInQueue={setIsInQueue}
						user={{ id: user.id, username: user.username }}
					/>
				)}

				{isInGame && (
					<Button
						onClick={() => {
							router.push(`/play/${roomId}`)
						}}
						className='w-full rounded-full px-6 py-7 font-normal md:text-lg'>
						Return to your game
					</Button>
				)}
			</div>

			{acceptedPlayers.length === 2 && (
				<AlertDialog open={true}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>A game is about to start.</AlertDialogTitle>
							<AlertDialogDescription>You will be redirected to the room soon.</AlertDialogDescription>
						</AlertDialogHeader>
					</AlertDialogContent>
				</AlertDialog>
			)}
		</section>
	)
}
