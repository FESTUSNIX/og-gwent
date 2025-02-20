'use client'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn, getVw } from '@/lib/utils'
import { FlagIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useNoticeContext } from '../../../context/NoticeContext'
import useGameContext from '../../../hooks/useGameContext'

type Props = {
	playerId: string
}

export const GiveUpButton = ({ playerId }: Props) => {
	const {
		sync,
		actions: { updatePlayerState }
	} = useGameContext()

	const { notice } = useNoticeContext()

	const router = useRouter()

	const resetGameState = async () => {
		// Updating lives to -1 means the player has given up the game
		updatePlayerState(playerId, { lives: -1 })
		sync()

		notice({
			title: 'You have given up the game',
			image: '/game/icons/end_lose.png',
			duration: 5000,
			description: 'You will be redirected to the main page in 5 seconds',
			onClose: () => router.push('/')
		})
	}

	return (
		<div className=''>
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button
						variant={'ghost'}
						size={'sm'}
						className='h-auto leading-tight hover:bg-destructive hover:text-destructive-foreground'
						style={{ fontSize: getVw(14), gap: getVw(8), padding: `${getVw(8)} ${getVw(12)}` }}>
						<span>Give Up</span>
						<FlagIcon className='h-auto fill-destructive-foreground' style={{ width: getVw(12) }} />
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>This will end the game and you will lose the current match.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className={cn(buttonVariants({ variant: 'destructive' }))}
							onClick={() => {
								resetGameState()
							}}>
							Give Up The Game
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
