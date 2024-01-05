'use client'
import { useCallback, useEffect, useState } from 'react'
import { Session, createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import Avatar from './Avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function AccountForm({ session }: { session: Session | null }) {
	const supabase = createClientComponentClient<Database>()

	const [loading, setLoading] = useState(true)
	const [fullname, setFullname] = useState<string | null>(null)
	const [username, setUsername] = useState<string | null>(null)
	const [website, setWebsite] = useState<string | null>(null)
	const [avatar_url, setAvatarUrl] = useState<string | null>(null)
	const user = session?.user

	const router = useRouter()

	const getProfile = useCallback(async () => {
		try {
			setLoading(true)

			const { data, error, status } = await supabase
				.from('profiles')
				.select(`full_name, username, website, avatar_url`)
				.eq('id', user?.id as string)
				.single()

			if (error && status !== 406) {
				throw error
			}

			if (data) {
				setFullname(data.full_name)
				setUsername(data.username)
				setWebsite(data.website)
				setAvatarUrl(data.avatar_url)
			}
		} catch (error) {
			alert('Error loading user data!')
		} finally {
			setLoading(false)
		}
	}, [user, supabase])

	useEffect(() => {
		getProfile()
	}, [user, getProfile])

	async function updateProfile({
		username,
		website,
		avatar_url
	}: {
		username: string | null
		fullname: string | null
		website: string | null
		avatar_url: string | null
	}) {
		try {
			setLoading(true)

			const { error } = await supabase.from('profiles').upsert({
				id: user?.id as string,
				full_name: fullname,
				username,
				website,
				avatar_url,
				updated_at: new Date().toISOString()
			})
			console.log(error)
			if (error) throw error

			alert('Profile updated!')
		} catch (error) {
			alert('Error updating the data!')
		} finally {
			setLoading(false)
		}
	}

	const handleSignOut = async () => {
		await supabase.auth.signOut()
		router.refresh()
	}

	if (!user) return null

	return (
		<div className='form-widget mx-auto flex flex-col items-center gap-6 pt-12'>
			<Avatar
				uid={user.id}
				username={username}
				url={avatar_url}
				onUpload={url => {
					setAvatarUrl(url)
					updateProfile({ fullname, username, website, avatar_url: url })
				}}
			/>

			<div className='mt-8 flex flex-col gap-2'>
				<Label htmlFor='email'>Email</Label>
				<Input id='email' type='text' value={session?.user.email} disabled />
			</div>
			<div className='flex flex-col gap-2'>
				<Label htmlFor='fullName'>Full Name</Label>
				<Input id='fullName' type='text' value={fullname || ''} onChange={e => setFullname(e.target.value)} />
			</div>
			<div className='flex flex-col gap-2'>
				<Label htmlFor='username'>Username</Label>
				<Input id='username' type='text' value={username || ''} onChange={e => setUsername(e.target.value)} />
			</div>
			<div className='flex flex-col gap-2'>
				<Label htmlFor='website'>Website</Label>
				<Input id='website' type='url' value={website || ''} onChange={e => setWebsite(e.target.value)} />
			</div>

			<div>
				<Button
					className=''
					onClick={() => updateProfile({ fullname, username, website, avatar_url })}
					disabled={loading}>
					{loading ? 'Loading ...' : 'Update'}
				</Button>
			</div>

			<div>
				<Button className='button block' variant={'destructive'} onClick={handleSignOut}>
					Sign out
				</Button>
			</div>
		</div>
	)
}
