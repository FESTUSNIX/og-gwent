'use client'

import { Button } from '@/components/ui/button'
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from '@/components/ui/sheet'
import React, { useState } from 'react'
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
				<SheetContent>
					<SheetHeader>
						<SheetTitle>Add a new card</SheetTitle>
					</SheetHeader>

					<div className='py-8'>
						<CardForm setIsOpen={setIsOpen} />
					</div>

					<SheetFooter>
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
