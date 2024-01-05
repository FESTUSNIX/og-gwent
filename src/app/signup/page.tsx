import { SignupForm } from '@/components/Auth/SignupForm'
import { Database } from '@/types/supabase'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

import { redirect } from 'next/navigation'
import React from 'react'

type Props = {}

const SignupPage = async (props: Props) => {
	const supabase = createServerComponentClient<Database>({ cookies })

	const {
		data: { session }
	} = await supabase.auth.getSession()

	if (session) {
		redirect('/')
	}

	return (
		<div className='grid-container flex flex-col items-center py-24'>
			<SignupForm />
		</div>
	)
}

export default SignupPage
