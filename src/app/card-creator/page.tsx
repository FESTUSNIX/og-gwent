import { H1 } from '@/components/ui/Typography/H1'
import { Creator } from './components/Creator'

type Props = {
	searchParams: { [key: string]: string | string[] | undefined }
}

const CardCreatorPage = ({ searchParams }: Props) => {
	return (
		<main className='grid-container py-16'>
			<header className=''>
				<H1>Create a new card</H1>
			</header>

			<Creator searchParams={searchParams} />
		</main>
	)
}

export default CardCreatorPage
