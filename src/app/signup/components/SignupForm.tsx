'use client'

import { TextField } from '@/components/Forms/TextField'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { RegisterPayload, RegisterValidator } from '@/lib/validators/Register'
import { Database } from '@/types/supabase'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export const SignupForm = () => {
	const supabase = createClientComponentClient<Database>()

	const searchParams = useSearchParams()
	const callbackUrl = searchParams.get('callbackUrl')
	const router = useRouter()

	const form = useForm<RegisterPayload>({
		resolver: zodResolver(RegisterValidator),
		defaultValues: {
			email: '',
			password: '',
			username: ''
		}
	})

	const { mutate: login, isPending } = useMutation({
		mutationFn: async (values: RegisterPayload) => {
			const { email, password } = values

			const { data, error } = await supabase.auth.signUp({
				email: email,
				password: password,
				options: {
					emailRedirectTo: `${location.origin}/auth/callback`,
					data: {
						username: values.username
					}
				}
			})

			if (error) throw Error(error.message)

			return 'OK'
		},
		onError: err => {
			return toast.error(err.message)
		},
		onSuccess: data => {
			form.reset()

			toast.success('Account created!')

			router.push(callbackUrl ?? '/')
		}
	})

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(e => login(e))} className='space-y-6'>
				<TextField
					control={form.control}
					accessorKey='email'
					label='Email'
					placeholder='john@doe.com'
					inputProps={{ className: 'py-6' }}
				/>
				<TextField
					control={form.control}
					accessorKey='username'
					label='Username'
					placeholder='Aa...'
					inputProps={{ className: 'py-6' }}
				/>
				<TextField
					control={form.control}
					accessorKey='password'
					type='password'
					label='Password'
					placeholder='***********'
					inputProps={{ className: 'py-6' }}
				/>

				<Button type='submit' className='mt-6 h-12 w-full rounded-full'>
					<span>{isPending ? 'Signing up...' : 'Sign up'}</span>
					{isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
				</Button>
			</form>
		</Form>
	)
}
