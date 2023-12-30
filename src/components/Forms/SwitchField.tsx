import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Control, FieldPath, FieldValues } from 'react-hook-form'

type Props<T extends FieldValues> = {
	control?: Control<T>
	accessorKey: FieldPath<T>
	label: string
	description?: string
}

export const SwitchField = <T extends FieldValues>({ control, label, accessorKey, description }: Props<T>) => {
	return (
		<FormField
			control={control}
			name={accessorKey}
			render={({ field }) => (
				<FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
					<div className='space-y-0.5 pr-8'>
						<FormLabel className='text-base'>{label}</FormLabel>
						{description && <FormDescription>{description}</FormDescription>}
					</div>
					<FormControl>
						<Switch checked={field.value} onCheckedChange={field.onChange} className='!mt-0' />
					</FormControl>
				</FormItem>
			)}
		/>
	)
}
