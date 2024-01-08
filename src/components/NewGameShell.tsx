'use client'

import { cn } from '@/lib/utils'
import { Database } from '@/types/supabase'
import { createId } from '@paralleldrive/cuid2'
import { Slot } from '@radix-ui/react-slot'
import { Session, createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import React, { forwardRef } from 'react'
import { toast } from 'sonner'

type Props = {
	children: React.ReactNode
	session: Session
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const NewGameShell = forwardRef<HTMLButtonElement, Props>(({ children, session, ...props }, ref) => {
	const router = useRouter()
	const supabase = createClientComponentClient<Database>()

	const createNewRoom = async () => {
		try {
			const id = createId()

			const { error: createRoomError } = await supabase.from('rooms').insert({
				id: id
			})
			if (createRoomError) throw Error(createRoomError.message)

			const { error: createPlayerError } = await supabase.from('players').upsert({
				id: session.user.id
			})
			if (createPlayerError) throw Error(createPlayerError.message)

			const { error: connectRoomWithPlayerError } = await supabase.from('room_players').insert({
				playerId: session.user.id,
				roomId: id
			})
			if (connectRoomWithPlayerError) throw Error(connectRoomWithPlayerError.message)

			router.push(`/play/${id}`)
		} catch (error: any) {
			toast.error(error.message ?? error.toString())
		}
	}

	return (
		<Slot className={cn(props.className)} ref={ref} onClick={() => createNewRoom()} {...props}>
			{children}
		</Slot>
	)
})

NewGameShell.displayName = 'NewGameShell'
