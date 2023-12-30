import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Props<T extends FieldValues> = {
	control?: Control<T>
	accessorKey: FieldPath<T>
	options: {
		label: string
		value: string
	}[]
	label?: string
	placeholder?: string
	description?: string
}

export const SelectField = <T extends FieldValues>({
	control,
	label,
	options,
	accessorKey,
	placeholder = 'Select an option',
	description
}: Props<T>) => {
	return (
		<FormField
			control={control}
			name={accessorKey}
			render={({ field }) => (
				<FormItem>
					{label && <FormLabel>{label}</FormLabel>}
					<FormControl>
						<Select onValueChange={field.onChange as (value: string) => void} defaultValue={field.value}>
							<FormControl>
								<SelectTrigger>
									<SelectValue placeholder={placeholder} />
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{options.map(option => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</FormControl>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
