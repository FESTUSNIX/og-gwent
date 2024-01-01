'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Braces } from 'lucide-react'
import { useState } from 'react'
import useGameContext from '../hooks/useGameContext'

type Props = {}

export const GameStateDisplay = (props: Props) => {
	const { gameState } = useGameContext()
	const [isVisible, setIsVisible] = useState(false)

	const toggleVisibility = () => setIsVisible(!isVisible)

	return (
		<div className='fixed left-4 top-4 z-50 flex flex-col items-start gap-4'>
			<Button size={'icon'} variant={'secondary'} onClick={toggleVisibility} className='shadow-md'>
				<Braces />
			</Button>
			{isVisible && (
				<div className={cn('flex flex-col gap-2 rounded-lg border bg-secondary/95 px-2 py-2')}>
					<ScrollArea className='h-[80vh] px-2'>
						<pre className='text-xs'>{JSON.stringify(gameState, null, 2)}</pre>
					</ScrollArea>
				</div>
			)}
		</div>
	)
}
