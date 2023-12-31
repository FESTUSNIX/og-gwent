'use client'

import { Database } from '@/types/supabase'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

export function SignupForm() {
	const supabase = createClientComponentClient<Database>()

	return (
		<Auth
			supabaseClient={supabase}
			view='sign_up'
			appearance={{ theme: ThemeSupa }}
			theme='dark'
			showLinks={false}
			providers={[]}
			redirectTo='http://localhost:3000/auth/callback'
		/>
	)
}
