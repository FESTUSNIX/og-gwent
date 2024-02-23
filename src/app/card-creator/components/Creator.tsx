'use client'

import React from 'react'
import { CardDataForm } from './CardDataForm'
import { CardPreview } from './CardPreview'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CardPayload, CardValidator } from '../validators/CardValidator'

type Props = {
	searchParams: { [key: string]: string | string[] | undefined }
}

export const Creator = ({ searchParams }: Props) => {
	const form = useForm<CardPayload>({
		resolver: zodResolver(CardValidator),
		defaultValues: {
			name: '',
			type: 'unit',
			faction: 'neutral',
			strength: undefined,
			row: undefined,
			ability: null,
			description: '',
			image: undefined
		}
	})

	return (
		<div className='my-16 grid h-[60vh] grid-cols-1 gap-12 md:grid-cols-2'>
			<section>
				<CardDataForm form={form} />
			</section>
			<section className='h-full min-h-0 max-md:mx-auto'>
				<CardPreview searchParams={searchParams} />
			</section>
		</div>
	)
}
