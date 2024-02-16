'use client'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = {
	isOpen: boolean
	setIsOpen?: (open: boolean) => void
	handleTurnChoose: (player: 'opponent' | 'host') => Promise<void>
}

export const ChooseTurnDialog = ({ isOpen, setIsOpen, handleTurnChoose }: Props) => {
	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className='text-center'>Would you like to go first?</AlertDialogTitle>
				</AlertDialogHeader>
				<div className='mb-4'>
					<p className='text-pretty px-6 text-center'>
						The Scoia&apos;tael faction perk allows you to decide who will get to go first.
					</p>
				</div>
				<AlertDialogFooter className='items-center sm:justify-center'>
					<AlertDialogAction
						className={cn(buttonVariants({ variant: 'destructive' }))}
						onClick={() => {
							handleTurnChoose('opponent')
						}}>
						Let Opponent Start
					</AlertDialogAction>
					<AlertDialogAction
						className={cn('bg-green-600 hover:bg-green-600/90')}
						onClick={() => {
							handleTurnChoose('host')
						}}>
						Go First
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
