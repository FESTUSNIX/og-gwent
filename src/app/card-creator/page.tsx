import { H1 } from '@/components/ui/Typography/H1'
import { Creator } from './components/Creator'
import LayoutContainer from '@/components/layout/container'

type Props = {
	searchParams: { [key: string]: string | string[] | undefined }
}

const CardCreatorPage = ({ searchParams }: Props) => {
	return (
		<LayoutContainer>
			<main className='grid-container pb-32 pt-16'>
				<header className=''>
					<H1>Create a new card</H1>
				</header>

				<Creator searchParams={searchParams} />
			</main>
		</LayoutContainer>
	)
}

export default CardCreatorPage
