'use client'

import { MultiSelectField } from '@/components/Forms/MultiSelectField'
import { SelectField } from '@/components/Forms/SelectField'
import { SwitchField } from '@/components/Forms/SwitchField'
import { TextField } from '@/components/Forms/TextField'
import { Form } from '@/components/ui/form'
import { FACTIONS } from '@/constants/FACTIONS'
import { ROW_TYPES } from '@/constants/ROW_TYPES'
import { CardValidator } from '@/lib/validators/Card'
import { FactionType } from '@/types/Faction'
import { RowType } from '@/types/RowType'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

type Props = {}

export const CardForm = (props: Props) => {
	const form = useForm<z.infer<typeof CardValidator>>({
		resolver: zodResolver(CardValidator),
		defaultValues: {
			name: '',
			strength: 0,
			type: undefined,
			factions: undefined,
			isHero: false
		}
	})

	function onSubmit(values: z.infer<typeof CardValidator>) {
		console.log(values)

		toast('Added card', { description: JSON.stringify(values) })
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} id='card-form' className='space-y-8'>
				<TextField accessorKey='name' label='Name' placeholder='eg. Poor fucking infrantry' />

				<TextField accessorKey='strength' type='number' label='Strength' />

				<SelectField accessorKey='type' options={RowTypeOptions} label='Type' />

				<MultiSelectField
					accessorKey='factions'
					options={FACTIONS.map(f => ({ label: f.name, value: f.slug }))}
					label='Factions'
				/>

				<SwitchField accessorKey='isHero' label='Hero card' />
			</form>
		</Form>
	)
}

const RowTypeOptions: { label: string; value: RowType }[] = [
	{
		label: 'Melee',
		value: 'melee'
	},
	{
		label: 'Range',
		value: 'range'
	},
	{
		label: 'Siege',
		value: 'siege'
	}
]
