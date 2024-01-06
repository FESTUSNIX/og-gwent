'use client'

import { EditField } from '@/components/Forms/EditField'
import { TextField } from '@/components/Forms/TextField'
import { H3 } from '@/components/ui/Typography/H3'
import { Separator } from '@/components/ui/separator'
import { ProfileValidator } from '@/lib/validators/Profile'
import { Database, Tables } from '@/types/supabase'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import React, { Fragment } from 'react'
import { Control, FieldPath, FieldValues } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import Avatar from './Avatar'

type Props = {
	user: Pick<Tables<'profiles'>, 'id' | 'username' | 'avatar_url'> & { email: string | undefined }
}

const ProfileValidatorWithEmail = ProfileValidator.extend({
	email: z.string().email()
})

export const ManageAccountData = ({ user }: Props) => {
	const supabase = createClientComponentClient<Database>()
	const items: {
		accessorKey: keyof z.infer<typeof ProfileValidatorWithEmail>
		title: string
		value: any
		disabled?: boolean
		customComponent?: <T extends FieldValues, K extends keyof T>(value: T[K]) => React.ReactNode
		editComponent: <T extends FieldValues>(props: { accessorKey: FieldPath<T>; control?: Control<T> }) => JSX.Element
	}[] = [
		{
			accessorKey: 'email',
			title: 'Email',
			value: user.email,
			disabled: true,
			editComponent: props => TextField({ placeholder: 'john@doe.com', ...props })
		},
		{
			accessorKey: 'username',
			title: 'Username',
			value: user.username,
			editComponent: props => TextField({ placeholder: 'Aa...', ...props })
		}
	]

	async function updateProfile({
		username,
		avatar_url
	}: {
		username: string | undefined
		avatar_url: string | undefined
	}) {
		try {
			const { error } = await supabase.from('profiles').upsert({
				id: user.id,
				username,
				avatar_url,
				updated_at: new Date().toISOString()
			})

			if (error) throw error

			toast.success('Profile updated!')
		} catch (error) {
			toast.error('Error updating the data!')
		}
	}

	return (
		<div className='space-y-4 rounded-lg border px-4 py-2.5 text-card-foreground shadow-sm'>
			<div>
				<H3 className='mb-2 text-sm font-bold leading-none'>Avatar</H3>

				<div>
					<Avatar uid={user.id} url={user.avatar_url} username={user.username} />
					{/* TODO: Add preset avatars to choose from */}
				</div>
			</div>

			<Separator />

			{items.map((item, i) => (
				<Fragment key={`${item.title}-${item.value}`}>
					<div className='grid grid-cols-[1fr_auto] grid-rows-[auto_auto] py-2'>
						<H3 className='text-sm font-bold leading-none'>{item.title}</H3>

						<EditField
							FormFieldComp={item.editComponent}
							accessorKey={item.accessorKey}
							editFn={updateProfile}
							defaultValue={item.value}
							PreviewComponent={item.customComponent}
							schema={ProfileValidator}
							disabled={item.disabled}
						/>
					</div>

					{i !== items.length - 1 && <Separator />}
				</Fragment>
			))}
		</div>
	)
}
