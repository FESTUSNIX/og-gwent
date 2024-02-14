'use client'

import { Muted } from '@/components/ui/Typography/Muted'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { createId } from '@paralleldrive/cuid2'
import { Clipboard, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { LobbyPlayer } from './Lobby'
import { Button } from '@/components/ui/button'

type Props = {
	lobbyCode: string | null
	isInGame: boolean
	setUser: React.Dispatch<React.SetStateAction<LobbyPlayer>>
}

export const InviteToLobby = ({ lobbyCode, isInGame, setUser }: Props) => {
	const router = useRouter()

	const [isOpen, setIsOpen] = useState(false)
	const [copied, setCopied] = useState(false)

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<Button
				variant={'outline'}
				disabled={isInGame}
				onClick={() => {
					if (isInGame) return
					if (lobbyCode) return setIsOpen(true)

					const generatedRoomId = createId()
					setUser(prevUser => ({
						...prevUser,
						isHost: true
					}))
					router.replace(`/?wr=${generatedRoomId}`)

					setIsOpen(true)
				}}
				className='relative flex h-auto items-center justify-center gap-3 text-lg font-normal text-muted-foreground'>
				<Mail className='size-4' />
				<span>Invite to lobby</span>
			</Button>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Invite players to lobby</DialogTitle>
				</DialogHeader>

				<div className='mt-4'>
					<div>
						<p className='mb-2'>Share this code with your friends.</p>

						<div className='relative'>
							<Input value={lobbyCode ?? ''} readOnly />
							<CopyToClipboard
								onCopy={() => {
									setCopied(true)
									setTimeout(() => setCopied(false), 1500)
								}}
								text={lobbyCode ?? ''}>
								<button className='absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border bg-secondary px-2 py-1 duration-300 hover:bg-secondary/90'>
									<span className='text-xs'>{copied ? 'Copied!' : 'Copy'}</span>
									<Clipboard className='size-3' />
								</button>
							</CopyToClipboard>
						</div>
					</div>

					<div className='my-6 flex items-center'>
						<Separator className='w-auto grow' />
						<span className='mx-2 shrink-0 text-xs leading-none text-muted-foreground'>OR</span>
						<Separator className='w-auto grow' />
					</div>

					<div>
						<p className='mb-2'>Invite your friends directly.</p>

						<Muted>Coming Soon</Muted>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
