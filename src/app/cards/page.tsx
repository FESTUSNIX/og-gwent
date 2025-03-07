import { Card } from '@/components/Card'
import { CardsPreview, CardsPreviewTrigger } from '@/components/CardsPreview'
import { FACTIONS } from '@/constants/FACTIONS'
import { createClient } from '@/lib/supabase/server'
import { CardType } from '@/types/Card'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import cardsJson from '../../../db/cards.json'
import { CardCreator } from './components/CardCreator'
import { FactionSwitch } from './components/FactionSwitch'
import LayoutContainer from '@/components/layout/container'

type Props = {
	searchParams: { [key: string]: string | string[] | undefined }
}

const CardsPage = async ({ searchParams }: Props) => {
	const supabase = await createClient()

	const { data: session } = await supabase.auth.getUser()

	if (!session.user) redirect('/login')

	const { data: user } = await supabase
		.from('profiles')
		.select('id, username, avatar_url, role')
		.eq('id', session?.user.id ?? '')
		.single()

	if (!user) redirect('/')

	const factionParam =
		(Array.isArray(searchParams.faction) ? searchParams.faction[0] : searchParams.faction) ?? FACTIONS[0].slug
	const currentFaction = FACTIONS.find(f => f.slug === factionParam)?.slug ?? FACTIONS[0].slug

	// const cards = await getCards()
	const cards = cardsJson.cards.filter(c => c.factions.includes(currentFaction)) as CardType[]

	return (
		<LayoutContainer>
			<main className='grid-container pt-12'>
				<h1 className='font-heading text-4xl'>Cards list</h1>

				<section className='my-16'>
					<h2 className='mb-4 text-2xl'>All cards</h2>
					<div className='mb-8 flex items-center justify-between'>
						<Suspense>
							<FactionSwitch />
						</Suspense>
						{user.role === 'ADMIN' && <CardCreator />}
					</div>

					<CardsPreview cards={cards}>
						<ul className='grid grid-cols-5 gap-4'>
							{cards.map((card, i) => (
								<CardsPreviewTrigger index={i} key={card.id}>
									<Card card={card} mode='preview' />
								</CardsPreviewTrigger>
							))}
						</ul>
					</CardsPreview>
				</section>
			</main>
		</LayoutContainer>
	)
}

export default CardsPage
