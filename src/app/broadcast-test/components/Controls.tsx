import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Braces } from 'lucide-react'
import React, { useState } from 'react'

type Props = {
	gameState: any
}

export const Controls = ({ gameState }: Props) => {
	const [isVisible, setIsVisible] = useState(false)
	const toggleDataVisibility = () => setIsVisible(!isVisible)

	return (
		<div className='fixed left-4 top-4 z-50 flex flex-row items-start gap-4'>
			<div className='relative'>
				<Button size={'icon'} variant={'secondary'} onClick={toggleDataVisibility} className='shadow-md'>
					<Braces />
				</Button>
				{isVisible && (
					<div
						className={cn(
							'absolute top-full flex translate-y-4 flex-col gap-2 rounded-lg border bg-secondary/95 px-2 py-2'
						)}>
						<ScrollArea className='h-[80vh] px-2'>
							{/* Filter out player hand, deck and discardPile on gameState */}
							<pre className='text-xs'>{JSON.stringify(gameState, null, 2)}</pre>
						</ScrollArea>
					</div>
				)}
			</div>
		</div>
	)
}
