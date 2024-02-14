import { Loader2 } from 'lucide-react'

export default function Loading() {
	return (
		<div className='fixed inset-0 flex items-center justify-center'>
			<p className='flex items-center gap-2 text-2xl'>
				<Loader2 className='size-6 animate-spin' />
				<span>Loading game</span>
			</p>
		</div>
	)
}
