'use client'

import { UserAvatar } from '@/components/UserAvatar'
import { Database } from '@/types/supabase'
import { createClient } from '@/lib/supabase/client'
import { ChangeEvent, useEffect, useState } from 'react'
import { toast } from 'sonner'
type Profiles = Database['public']['Tables']['profiles']['Row']

export default function Avatar({
	uid,
	url,
	username
}: {
	uid: string
	url: Profiles['avatar_url']
	username: Profiles['username']
}) {
	const supabase = createClient()
	const [avatarUrl, setAvatarUrl] = useState<Profiles['avatar_url']>(null)
	const [uploading, setUploading] = useState(false)

	useEffect(() => {
		async function downloadImage(path: string) {
			try {
				const { data, error } = await supabase.storage.from('avatars').download(path)
				if (error) {
					throw error
				}

				const url = URL.createObjectURL(data)
				setAvatarUrl(url)
			} catch (error) {
				console.log('Error downloading image: ', error)
			}
		}

		if (url) downloadImage(url)
	}, [url, supabase])

	const uploadAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
		try {
			setUploading(true)

			if (!event.target.files || event.target.files.length === 0) {
				throw new Error('You must select an image to upload.')
			}

			const file = event.target.files[0]
			const filePath = `/${uid}/avatar`

			const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })

			if (uploadError) {
				throw new Error(uploadError.message)
			}

			const { error } = await supabase.from('profiles').upsert({ id: uid, avatar_url: filePath })

			if (error) {
				throw new Error(error.message)
			}

			console.log('uploaded', filePath)
			return filePath
		} catch (error) {
			toast.error('Error uploading avatar!')
		} finally {
			setUploading(false)
		}
	}

	return (
		<label className='group relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-lg border'>
			<UserAvatar
				user={{ avatar_url: avatarUrl, username: username }}
				useFormattedUrl
				className='h-full w-full rounded-lg'
			/>

			<input
				type='file'
				id='single'
				accept='image/*'
				onChange={uploadAvatar}
				disabled={uploading}
				className='invisible absolute inset-0'
			/>

			<div className='pointer-events-none absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 duration-300 group-hover:opacity-100'>
				<span className='text-xs font-bold uppercase'>Update avatar</span>
			</div>
		</label>
	)
}
