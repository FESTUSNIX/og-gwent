'use client'

import { MultiSelectField } from '@/components/Forms/MultiSelectField'
import { SelectField } from '@/components/Forms/SelectField'
import { TextField } from '@/components/Forms/TextField'
import { TextareaField } from '@/components/Forms/TextareaField'
import { Form } from '@/components/ui/form'
import { ABILITIES } from '@/constants/ABILITIES'
import { FACTIONS } from '@/constants/FACTIONS'
import { ROW_TYPES } from '@/constants/ROW_TYPES'
import { capitalize } from '@/lib/utils'
import { CardPayload, CardValidator } from '@/lib/validators/Card'
import { FactionType } from '@/types/Faction'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { SlugField } from './SlugField'

type Props = {
	setIsOpen: (open: boolean) => void
}

export const CardForm = ({ setIsOpen }: Props) => {
	const searchParams = useSearchParams()
	const factionParam = searchParams.get('faction') as FactionType | null

	const form = useForm<CardPayload>({
		resolver: zodResolver(CardValidator),
		defaultValues: {
			name: '',
			slug: '',
			type: 'unit',
			factions: factionParam ? [factionParam] : [],
			strength: undefined,
			row: undefined,
			ability: undefined,
			description: '',
			group: undefined,
			amount: 1
		}
	})

	const { mutate: createCard, isPending } = useMutation({
		mutationFn: async (values: CardPayload) => {
			console.log('CREATING', values)

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

	// If type is weather - disable strength, row, group

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(e => createCard(e))} id='card-form' className='space-y-8 px-1'>
				<TextField accessorKey='name' label='Name' placeholder='Geralt of Rivia' />

				<SlugField form={form} />

				<SelectField accessorKey='type' options={CardTypeOptions} label='Type' />

				<MultiSelectField
					accessorKey='factions'
					options={FACTIONS.map(f => ({ label: f.name, value: f.slug }))}
					label='Factions'
				/>

				<TextField accessorKey='strength' type='number' label='Strength' />

				<SelectField accessorKey='row' options={RowTypeOptions} label='Row' />

				<SelectField accessorKey='ability' options={AbilityOptions} label='Ability' />

				<TextField
					accessorKey='group'
					label='Group'
					placeholder='eg. cerys, crones'
					description='Used for tight bond and muster cards'
				/>

				<TextField
					accessorKey='amount'
					type='number'
					label='Amount'
					description='Max amount of cards you can add to your deck'
				/>

				<TextareaField
					accessorKey='description'
					label='Description'
					placeholder="I's a war veteran! ... spare me a crown?"
				/>
			</form>
		</Form>
	)
}

type Option = {
	label: string
	value: string
}

const CardTypeOptions: Option[] = [
	{
		label: 'Unit',
		value: 'unit'
	},
	{
		label: 'Hero',
		value: 'hero'
	},
	{
		label: 'Special',
		value: 'special'
	},
	{
		label: 'Weather',
		value: 'weather'
	}
]

const RowTypeOptions: Option[] = [
	{ label: 'None', value: 'none' },
	...ROW_TYPES.map(row => ({ label: capitalize(row), value: row }))
]

const AbilityOptions = ABILITIES.toSorted().map(ability => ({ label: capitalize(ability), value: ability }))
