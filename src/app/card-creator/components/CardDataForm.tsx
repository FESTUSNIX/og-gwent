'use client'

import { FileField } from '@/components/Forms/FileField'
import { SelectField } from '@/components/Forms/SelectField'
import { TextField } from '@/components/Forms/TextField'
import { TextareaField } from '@/components/Forms/TextareaField'
import { Form } from '@/components/ui/form'
import { ABILITIES } from '@/constants/ABILITIES'
import { FACTIONS } from '@/constants/FACTIONS'
import { capitalize, deepEqual } from '@/lib/utils'
import { Ability } from '@/types/Ability'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useTransition } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { CardPayload, CardValidator } from '../validators/CardValidator'

type Props = {
	form: UseFormReturn<CardPayload>
}

export const CardDataForm = ({ form }: Props) => {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()!

	const [_, startTransition] = useTransition()

	const createQueryString = useCallback(
		(queries: { [key: string]: string | undefined | null }) => {
			const params = new URLSearchParams(searchParams)

			Object.entries(queries).map(([key, value]) => {
				if (value === undefined || value === null || value === '') return params.delete(key)

				return params.set(key, value)
			})

			return params.toString()
		},
		[searchParams]
	)

	const createFormPayload = (data: Partial<CardPayload> | undefined) => {
		const imageURL = data?.image ? URL.createObjectURL(data.image) : undefined

		return {
			...data,
			strength: data?.strength?.toString(),
			image: imageURL
		}
	}

	const updateQueryParams = async (data: Partial<CardPayload> | undefined) => {
		const payload = createFormPayload(data)

		const updatedQueryString = createQueryString(payload)

		startTransition(() => {
			router.replace(pathname + '?' + updatedQueryString, {
				scroll: false
			})
		})
	}

	useEffect(() => {
		const params = new URLSearchParams(searchParams)

		const name = params.get('name') ?? undefined
		const type = params.get('type') ?? undefined
		const faction = params.get('faction') ?? undefined
		const strength = params.get('strength') ?? undefined
		const row = params.get('row') ?? undefined
		const ability = params.get('ability') ?? undefined
		const description = params.get('description') ?? undefined

		const values = CardValidator.partial().parse({
			name,
			type,
			faction,
			strength: parseInt(strength ?? '0') || undefined,
			row: row ?? null,
			ability: ability ?? null,
			description: description ?? ''
		})

		const { image, ...currentValues } = form.getValues()

		if (deepEqual(values, currentValues)) return

		form.reset(v => ({
			...values,
			name: values.name ?? '',
			type: values.type ?? 'unit',
			faction: values.faction ?? 'neutral',
			image: v.image,
			ability: values.ability ?? null,
			row: values.row ?? null
		}))

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams])

	useEffect(() => {
		const subscribtion = form.watch(values => {
			updateQueryParams(values)
		})

		return () => subscribtion.unsubscribe()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form])

	const type = form.watch('type')

	const getAbilities = () => {
		let abilities: Ability[] = []

		const weatherAbilities: Ability[] = ['frost', 'fog', 'rain', 'storm', 'clear_weather']
		const specialAbilities: Ability[] = ['scorch', 'horn', 'decoy']

		if (type === 'weather') abilities = weatherAbilities
		if (type === 'special') abilities = specialAbilities
		if (type === 'hero' || type === 'unit') abilities = ABILITIES.filter(a => !weatherAbilities.includes(a))

		return abilities
	}

	const AbilityOptions = [
		{ label: 'None', value: 'null' },
		...getAbilities()
			.toSorted()
			.map(ability => ({ label: capitalize(ability), value: ability }))
	]

	return (
		<Form {...form}>
			<form onSubmit={e => e.preventDefault()} id='card-form' className='space-y-4'>
				<TextField accessorKey='name' label='Name' placeholder='Geralt of Rivia' />

				<FileField accessorKey='image' label='Image' />

				<SelectField accessorKey='type' options={CardTypeOptions} label='Type' />

				<SelectField
					accessorKey='faction'
					options={FACTIONS.map(f => ({ label: f.name, value: f.slug }))}
					label='Faction'
				/>

				<TextField accessorKey='strength' type='number' label='Strength' />

				<SelectField accessorKey='row' options={RowTypeOptions} label='Row' />

				<SelectField accessorKey='ability' options={AbilityOptions} label='Ability' />

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
	{ label: 'None', value: 'null' },
	...['melee', 'range', 'siege', 'agile'].map(row => ({ label: capitalize(row), value: row }))
]
