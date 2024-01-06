import { H1 } from '@/components/ui/Typography/H1'
import { Muted } from '@/components/ui/Typography/Muted'
import { Separator } from '@/components/ui/separator'

type Props = {}

const AccountDecksPage = (props: Props) => {
	return (
		<div className='flex h-full flex-col gap-8'>
			<header>
				<H1>Decks</H1>
				<Muted className='max-w-md text-base'>
					Manage your decks. You can edit your default and favourite decks from this page.
				</Muted>

				<Separator className='mt-4' />
			</header>

			<section>Coming Soon</section>
		</div>
	)
}

export default AccountDecksPage
