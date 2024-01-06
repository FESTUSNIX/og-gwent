'use client'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import React, { ReactNode, useState } from 'react'
import { Control, FieldPath, FieldValues, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

type Props<T extends FieldValues, K extends keyof T> = {
	accessorKey: FieldPath<T>
	defaultValue: T[K]
	schema: z.ZodObject<any>
	FormFieldComp: (props: { accessorKey: FieldPath<T>; control?: Control<T> }) => React.JSX.Element
	PreviewComponent?: (value: T[K]) => React.ReactNode
	disabled?: boolean
	apiPath?: string
	editFn?: (values: any) => Promise<void>
}

export const EditField = <T extends FieldValues, K extends keyof T>({
	accessorKey,
	defaultValue,
	PreviewComponent,
	FormFieldComp,
	disabled,
	apiPath,
	schema,
	editFn
}: Props<T, K>) => {
	const [isEditing, setIsEditing] = useState(false)
	const [optimisticValue, setOptimisticValue] = useState(defaultValue)

	const FieldValidator = schema.pick({ [accessorKey]: true })
	type FieldPayload = z.infer<typeof FieldValidator>

	const form = useForm<FieldPayload>({
		resolver: zodResolver(FieldValidator),
		defaultValues: {
			[accessorKey]: defaultValue
		}
	})

	const { mutate: updateField, isPending } = useMutation({
		mutationFn: async (values: FieldPayload) => {
			const payload: Partial<FieldPayload> = {
				...values
			}

			setOptimisticValue(values[accessorKey])
			setIsEditing(false)

			if (apiPath) {
				await axios.patch(apiPath, payload)
			}

			if (editFn) {
				await editFn(values)
			}

			return payload
		},
		onError: err => {
			toast.dismiss()
			setOptimisticValue(defaultValue)
			setIsEditing(true)

			if (err instanceof AxiosError) {
				if (err.response?.status === 404) {
					return toast.error('Resource not found.')
				}

				if (err.response?.status === 403) {
					return toast.error('You are not allowed to update this field.')
				}

				if (err.response?.status === 422) {
					return toast.error('Incorrect data.')
				}
			}

			return toast.error('Something went wrong!')
		},
		onSuccess: data => {
			toast.dismiss()

			form.reset()

			setIsEditing(false)
			setOptimisticValue(data[accessorKey])
		}
	})

	return (
		<>
			<div className='col-start-1 row-start-2'>
				{!isEditing && (
					<div className='break-all text-muted-foreground'>
						{(PreviewComponent && PreviewComponent(optimisticValue)) ?? ((optimisticValue as ReactNode) || 'No data')}
					</div>
				)}
				{isEditing && (
					<Form {...form}>
						<form onSubmit={form.handleSubmit(e => updateField(e))}>
							<div className='mt-2'>
								<FormFieldComp control={form.control as unknown as Control<T>} accessorKey={accessorKey} />
							</div>

							<Button type='submit' disabled={isPending} size={'sm'} className='ml-auto mt-2 flex'>
								{isPending && <Loader2 className='h-4 w-4 animate-spin' />}
								{isPending ? 'Updating' : 'Update'}
							</Button>
						</form>
					</Form>
				)}
			</div>
			<div className='row-span-full self-center justify-self-end'>
				{!disabled && (
					<Button
						variant={'link'}
						type='button'
						onClick={() => {
							if (isEditing) {
								setIsEditing(false)
								form.reset()
							} else {
								setIsEditing(true)
							}
						}}>
						{isEditing ? 'Cancel' : 'Edit'}
					</Button>
				)}
			</div>
		</>
	)
}
