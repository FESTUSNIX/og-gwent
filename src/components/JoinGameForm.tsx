'use client'

import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from './ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form'
import { Input } from './ui/input'
import { useRouter } from 'next/navigation'

type Props = {}

const formSchema = z.object({
	code: z.string().length(24, 'Provided code is invalid.')
})

export const JoinGameForm = (props: Props) => {
	const router = useRouter()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			code: ''
		}
	})

	function onSubmit(values: z.infer<typeof formSchema>) {
		// TODO: Check if room exists
		// If it does, redirect to room page

		router.push(`/play/${values.code}`)
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='pb-4'>
				<FormField
					control={form.control}
					name='code'
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<>
									<label
										className={cn(
											'relative hidden w-full cursor-text items-center overflow-hidden rounded-full border border-input bg-transparent ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 sm:flex'
										)}>
										<input
											autoComplete={'off'}
											placeholder='Enter room code'
											{...field}
											className='h-full grow bg-transparent py-2 pl-6 pr-2 text-sm outline-none placeholder:text-muted-foreground md:text-lg'
										/>

										<Button className='shrink-0 rounded-full px-6 py-7 font-normal md:text-lg' type='submit'>
											Join game
										</Button>
									</label>

									<div className='flex flex-col space-y-2 sm:hidden'>
										<Input
											autoComplete={'off'}
											placeholder='Enter room code'
											{...field}
											className='h-auto rounded-full py-4 pl-6 pr-2'
										/>
										<Button className='grow rounded-full px-6 py-7 font-normal' type='submit'>
											Join game
										</Button>
									</div>
								</>
							</FormControl>

							<FormMessage className='text-left' />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	)
}
