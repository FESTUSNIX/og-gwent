import React from 'react'
import { ScrollArea } from '../ui/scroll-area'
import { Navbar } from '../Navbar'

type Props = {
	children: React.ReactNode
}

const LayoutContainer = ({ children }: Props) => {
	return (
		<div className='ambient-background h-screen w-full grow overflow-hidden p-3'>
			<div className='ambient-background relative z-0 flex h-full min-h-full min-w-full grow flex-col overflow-hidden rounded-2xl border'>
				<Navbar />
				<ScrollArea
					scrollBarClassName='!right-1 py-4'
					className='h-[calc(100vh-1rem)] bg-background/90 backdrop-blur-[2px]'>
					{children}
				</ScrollArea>
			</div>
		</div>
	)
}

export default LayoutContainer
