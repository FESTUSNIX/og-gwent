import LayoutContainer from '@/components/layout/container'
import React from 'react'
import SidebarNav from './components/SidebarNav'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
	return (
		<LayoutContainer>
			<main className='grid-container h-full'>
				<div className='flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10'>
					<aside className='h-auto md:h-full md:border-r md:pr-4'>
						<div className='md:top-navOffset py-8 md:sticky md:bottom-0'>
							<SidebarNav />
						</div>
					</aside>
					<main className='flex w-full flex-col overflow-hidden pt-8'>{children}</main>
				</div>
			</main>
		</LayoutContainer>
	)
}
