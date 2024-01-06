import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { urlFor } from '@/lib/supabase/getUrlFor'
import { Tables } from '@/types/supabase'
import { AvatarProps } from '@radix-ui/react-avatar'
import { UserIcon } from 'lucide-react'

type Props = {
	user: Pick<Tables<'profiles'>, 'username' | 'avatar_url'>
	useFormattedUrl?: boolean
} & AvatarProps

export const UserAvatar = ({ user, useFormattedUrl = false, ...props }: Props) => {
	return (
		<Avatar {...props}>
			{user.avatar_url ? (
				<AvatarImage
					src={useFormattedUrl ? user.avatar_url : urlFor('avatars', user.avatar_url).publicUrl}
					alt={`${user.username}'s profile picture`}
					referrerPolicy='no-referrer'
					className='aspect-square h-full w-full rounded-[inherit] object-cover'
				/>
			) : (
				<AvatarFallback className='aspect-square h-full w-full rounded-[inherit] object-cover'>
					<span className='sr-only'>{user.username?.slice(0, 2)}</span>
					<UserIcon className='h-4 w-4' />
				</AvatarFallback>
			)}
		</Avatar>
	)
}
