'use client'

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input, InputProps } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Control, FieldPath, FieldValues } from 'react-hook-form'

type Props<T extends FieldValues> = {
	className?: string
	accessorKey: FieldPath<T>
	control?: Control<T>
	label?: string
	description?: string
} & { inputProps?: InputProps }

export const FileField = <T extends FieldValues>({
	className,
	accessorKey,
	control,
	label,
	description,
	inputProps
}: Props<T>) => {
	return (
		<FormField
			control={control}
			name={accessorKey}
			render={({ field }) => (
				<FormItem className={cn('w-full grow', className)}>
					{label && <FormLabel>{label}</FormLabel>}
					<FormControl>
						<Input
							{...inputProps}
							type={'file'}
							onChange={e => field.onChange(e.target.files?.[0])}
							onBlur={field.onBlur}
							disabled={field.disabled}
							name={field.name}
							ref={field.ref}
						/>
					</FormControl>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
