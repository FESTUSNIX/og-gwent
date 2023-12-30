'use client'

import { MultiSelectField } from '@/components/Forms/MultiSelectField'
import { SelectField } from '@/components/Forms/SelectField'
import { SwitchField } from '@/components/Forms/SwitchField'
import { TextField } from '@/components/Forms/TextField'
import { Form } from '@/components/ui/form'
import { FACTIONS } from '@/constants/FACTIONS'
import { CardPayload, CardValidator } from '@/lib/validators/Card'
import { RowType } from '@/types/RowType'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type Props = {
	setIsOpen: (open: boolean) => void
}

export const CardForm = ({ setIsOpen }: Props) => {
	const form = useForm<CardPayload>({
		resolver: zodResolver(CardValidator),
		defaultValues: {
			name: '',
			strength: 0,
			type: undefined,
			factions: undefined,
			isHero: false
		}
	})

	const { mutate: createCard, isPending } = useMutation({
		mutationFn: async (values: CardPayload) => {
			const { data } = await axios.post(`/api/cards`, values)

			return data
		},
		onError: err => {
			if (err instanceof AxiosError) {
				if (err.response?.status === 422) {
					return toast('Incorrect data.')
				}
			}

			return toast('Something went wrong.')
		},
		onSuccess: data => {
			toast.success('Successfully added a new card')

			form.reset()

			setIsOpen(false)
		}
	})

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(e => createCard(e))} id='card-form' className='space-y-8'>
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
