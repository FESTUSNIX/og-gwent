'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from '@/components/ui/sheet'
import { useState } from 'react'
import { CardForm } from './components/CardForm'

type Props = {}

export const CardCreator = (props: Props) => {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<div>
			<Sheet open={isOpen} onOpenChange={open => setIsOpen(open)}>
				<SheetTrigger asChild>
					<Button size={'sm'}>Add new card</Button>
				</SheetTrigger>
				<SheetContent className='pr-2'>
					<SheetHeader className='pr-4'>
						<SheetTitle>Add a new card</SheetTitle>
					</SheetHeader>

					<div className='py-8'>
						<ScrollArea className='h-[calc(100vh-4rem-3rem-2.5rem-1.75rem)] pr-4'>
							<CardForm setIsOpen={setIsOpen} />
						</ScrollArea>
					</div>

					<SheetFooter className='pr-4'>
						<SheetClose asChild>
							<Button variant={'secondary'}>Cancel</Button>
						</SheetClose>

						<Button type='submit' form='card-form'>
							Add this card
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</div>
	)
}
