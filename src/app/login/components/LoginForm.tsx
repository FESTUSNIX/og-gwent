'use client'

import { TextField } from '@/components/Forms/TextField'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { createClient } from '@/lib/supabase/client'
import { LoginPayload, LoginValidator } from '@/lib/validators/Login'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export const LoginForm = () => {
	const supabase = createClient()

	const searchParams = useSearchParams()
	const callbackUrl = searchParams.get('callbackUrl')
	const router = useRouter()

	const form = useForm<LoginPayload>({
		resolver: zodResolver(LoginValidator),
		defaultValues: {
			email: '',
			password: ''
		}
	})

	const { mutate: login, isPending } = useMutation({
		mutationFn: async (values: LoginPayload) => {
			const { email, password } = values

			const { error } = await supabase.auth.signInWithPassword({
				email: email,
				password: password
			})

			if (error) throw Error(error.message)

			return 'OK'
		},
		onError: err => {
			return toast.error(err.message)
		},
		onSuccess: data => {
			form.reset()

			router.refresh()
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
					accessorKey='password'
					type='password'
					label='Password'
					placeholder='***********'
					inputProps={{ className: 'py-6' }}
				/>

				<Button type='submit' className='mt-6 h-12 w-full rounded-full'>
					<span>{isPending ? 'Logging in...' : 'Log in'}</span>
					{isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
				</Button>
			</form>
		</Form>
	)
}
