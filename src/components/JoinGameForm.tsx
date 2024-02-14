'use client'

import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from './ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form'
import { Input } from './ui/input'

type Props = {
	isInGame: boolean
}

const formSchema = z.object({
	code: z.string()
})

export const JoinGameForm = ({ isInGame }: Props) => {
	const router = useRouter()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			code: ''
		}
	})

	function onSubmit(values: z.infer<typeof formSchema>) {
		if (isInGame) return

		router.push(`/?wr=${values.code}`)
		form.reset()
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name='code'
					disabled={isInGame}
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
											className='h-full grow bg-transparent py-2 pl-6 pr-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50 md:text-lg'
										/>

										<Button
											className='shrink-0 rounded-full px-6 py-7 font-normal md:text-lg'
											type='submit'
											disabled={isInGame}>
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
										<Button className='grow rounded-full px-6 py-7 font-normal' type='submit' disabled={isInGame}>
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
