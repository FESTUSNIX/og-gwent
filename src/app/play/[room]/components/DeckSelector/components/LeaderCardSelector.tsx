import React from 'react'

type Props = {}

export const LeaderCardSelector = (props: Props) => {
	return (
		<div className='flex aspect-[4/7] w-32 flex-col items-center overflow-hidden rounded-lg bg-stone-600'>
			<div className='w-full grow bg-stone-500'></div>
			<div className='h-16 w-full bg-stone-700 px-4 py-2 text-center'>
				<h4 className='text-sm'>Foltest King of Temeria</h4>
			</div>
		</div>
	)
}
