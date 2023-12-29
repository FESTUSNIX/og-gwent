import { host, opponent } from '@/app/page'
import { Side } from './components/Side'

type Props = {}

export const Board = (props: Props) => {
	return (
		<div className='grid h-full grid-rows-2 gap-y-6 bg-stone-600 py-2'>
			<Side player={opponent} side='opponent' />
			<Side player={host} side='host' />
		</div>
	)
}
