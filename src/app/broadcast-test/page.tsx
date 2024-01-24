import { H1 } from '@/components/ui/Typography/H1'
import React from 'react'
import { StateHandler } from './components/StateHandler'
import { supabaseServer } from '@/lib/supabase/supabaseServer'

type Props = {}

const BroadcastTestPage = async (props: Props) => {
	const supabase = supabaseServer()

	const {
		data: { session }
	} = await supabase.auth.getSession()

	const user = session?.user

	if (!user) {
		return <div>No user</div>
	}

	return (
		<div className='mx-auto flex max-w-4xl flex-col items-center py-24'>
			<div className='mt-12'>
				<StateHandler userId={user.id} userName={user.email ?? 'no email'} />
			</div>
		</div>
	)
}

export default BroadcastTestPage
