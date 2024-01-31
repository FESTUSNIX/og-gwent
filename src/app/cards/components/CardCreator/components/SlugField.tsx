import { Button } from '@/components/ui/button'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { CardPayload } from '@/lib/validators/Card'
import { UseFormReturn } from 'react-hook-form'
import slugify from 'react-slugify'

type Props = {
	form: UseFormReturn<CardPayload>
}

export const SlugField = ({ form }: Props) => {
	const generateSlug = (from: string) => slugify(from, { delimiter: '_' })
	const name = form.getValues('name')

	return (
		<div>
			<FormField
				name={'slug'}
				render={({ field }) => (
					<FormItem className={cn('w-full grow')}>
						<FormLabel>Slug</FormLabel>
						<div className='flex items-center gap-1'>
							<FormControl>
								<Input {...field} onChange={field.onChange} value={field.value ?? ''} placeholder='geralt_of_rivia' />
							</FormControl>
							<Button
								type='button'
								disabled={!name}
								onClick={e => {
									e.preventDefault()

									const slug = generateSlug(form.getValues('name'))
									form.setValue('slug', slug)
								}}>
								Generate
							</Button>
						</div>
						<FormDescription>A unique identifier for a card</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	)
}
