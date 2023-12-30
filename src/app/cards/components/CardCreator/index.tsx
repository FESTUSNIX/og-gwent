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
import React from 'react'
import { CardForm } from './components/CardForm'

type Props = {}

export const CardCreator = (props: Props) => {
	return (
		<div>
			<Sheet>
				<SheetTrigger asChild>
					<Button size={'sm'}>Add new card</Button>
				</SheetTrigger>
				<SheetContent>
					<SheetHeader>
						<SheetTitle>Add a new card</SheetTitle>
					</SheetHeader>

					<div className='py-8'>
						<CardForm />
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
