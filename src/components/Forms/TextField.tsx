'use client'

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input, InputProps } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { HTMLInputTypeAttribute } from 'react'
import { Control, FieldPath, FieldValues } from 'react-hook-form'

type Props<T extends FieldValues> = {
	className?: string
	accessorKey: FieldPath<T>
	control?: Control<T>
	label?: string
	description?: string
	placeholder?: string
	type?: HTMLInputTypeAttribute
} & { inputProps?: InputProps }

export const TextField = <T extends FieldValues>({
	className,
	accessorKey,
	control,
	label,
	description,
	placeholder,
	type,
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
							{...field}
							{...inputProps}
							onChange={e => field.onChange(type === 'number' ? e.target.valueAsNumber : e.target.value)}
							placeholder={placeholder}
							type={type}
							value={field.value ?? ''}
						/>
					</FormControl>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
