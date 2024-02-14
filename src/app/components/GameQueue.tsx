'use client'

import { Button } from '@/components/ui/button'
import { Database, Tables } from '@/types/supabase'
import { createId } from '@paralleldrive/cuid2'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { toast } from 'sonner'

type Props = {
	user: Pick<Tables<'profiles'>, 'id' | 'username'>
	isInQueue: boolean
	setIsInQueue: Dispatch<SetStateAction<boolean>>
}

export const GameQueue = ({ user, isInQueue, setIsInQueue }: Props) => {
	const supabase = createClientComponentClient<Database>()
	const router = useRouter()

	const createNewRoom = async () => {
		try {
			const { data } = await supabase.from('room_players').select('playerId').eq('playerId', user.id).single()

			if (data?.playerId) {
				throw Error('You are already in a room!')
			}

			const id = createId()

			const { error: createRoomError } = await supabase.from('rooms').insert({
				id: id,
				roomOwner: user.id
			})
			if (createRoomError) throw Error(createRoomError.message)

			return id
		} catch (error: any) {
			toast.error(error.message ?? error.toString())
		}
	}

	useEffect(() => {
		if (!isInQueue) return

		const queue = supabase.channel(`queue`)

		queue
			.on('presence', { event: 'join' }, async ({ key, newPresences }) => {
				console.log('join', key, newPresences)

				const joinedUser = newPresences[0]
				const state = queue.presenceState<{ id: string; username: string }>()

				const players = Object.values(state).map(presence => presence[0])
				if (players.filter(p => p.id !== user.id).length < 1) return

				const firstPlayerInQueue = players[0]
				if (firstPlayerInQueue.id !== user.id || joinedUser.id === user.id) return

				const matchedPlayer = players.find(p => p.id !== user.id)

				if (matchedPlayer) {
					if (firstPlayerInQueue.id === user.id) {
						const roomId = await createNewRoom()

						if (roomId) {
							queue.send({
								type: 'broadcast',
								event: 'redirectToRoom',
								payload: {
									to: matchedPlayer.presence_ref,
									roomId: roomId
								}
							})

							router.push(`/play/${roomId}`)
						}
					}
				}
			})
			.on('broadcast', { event: 'redirectToRoom' }, ({ payload }) => {
				const state = queue.presenceState<{ id: string; username: string }>()

				const currentPlayer = Object.values(state)
					.map(presence => presence[0])
					.find(p => p.id === user.id)

				if (payload.to !== currentPlayer?.presence_ref) return

				router.push(`/play/${payload.roomId}`)
			})
			.subscribe(async status => {
				if (status !== 'SUBSCRIBED' || !isInQueue) return

				const presenceTrackStatus = await queue.track(user)
			})

		return () => {
			queue.untrack()
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isInQueue])

	return (
		<Button
			onClick={() => setIsInQueue(prev => !prev)}
			className='w-full rounded-full px-6 py-7 font-normal md:text-lg'>
			{isInQueue ? 'Cancel' : 'Join game'}
		</Button>
	)
}
