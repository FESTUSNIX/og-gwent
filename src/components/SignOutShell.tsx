'use client'

import { Slot, SlotProps } from '@radix-ui/react-slot'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SignOut } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { forwardRef } from 'react'

type Props = SlotProps &
	React.RefAttributes<HTMLElement> & {
		signOutOptions?: SignOut
	}

export const SignOutShell = forwardRef<HTMLElement, Props>(({ onClick, signOutOptions, children, ...props }, ref) => {
	const supabase = createClientComponentClient()
	const router = useRouter()

	async function signOut() {
		const { error } = await supabase.auth.signOut(signOutOptions)

		if (error) {
			console.error(error)
			return
		}

		router.refresh()
	}

	return (
		<Slot
			ref={ref}
			{...props}
			onClick={e => {
				onClick && onClick(e)

				signOut()
			}}>
			{children}
		</Slot>
	)
})
SignOutShell.displayName = 'SignOutShell'
