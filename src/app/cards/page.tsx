import { Card } from '@/components/Card'
import { FACTIONS } from '@/constants/FACTIONS'
import { getCards } from '@/queries/cards'
import { CardCreator } from './components/CardCreator'
import { FactionSwitch } from './components/FactionSwitch'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { cookies } from 'next/headers'

type Props = {
	searchParams: { [key: string]: string | string[] | undefined }
}

const CardsPage = async ({ searchParams }: Props) => {
	const supabase = createServerComponentClient<Database>({
		cookies
	})

	const {
		data: { session }
	} = await supabase.auth.getSession()

	if (!session) redirect('/login')
	if (session.user.role !== 'ADMIN') redirect('/')

	const cards = await getCards()

	const factionParam =
		(Array.isArray(searchParams.faction) ? searchParams.faction[0] : searchParams.faction) ?? FACTIONS[0].slug
	const currentFaction = FACTIONS.find(f => f.slug === factionParam)?.slug ?? FACTIONS[0].slug

	return (
		<main className='grid-container pt-12'>
			<h1 className='text-4xl'>Gwent cards</h1>

			<section className='my-16'>
				<h2 className='mb-4 text-2xl'>All cards</h2>
				<div className='mb-8 flex items-center justify-between'>
					<Suspense>
						<FactionSwitch />
					</Suspense>
					<CardCreator />
				</div>

				<ul className='grid grid-cols-6 gap-4'>
					{cards
						.filter(c => c.factions.includes(currentFaction))
						.map(card => (
							<Card key={card.id} card={card} mode='preview' />
						))}
				</ul>
			</section>
		</main>
	)
}

export default CardsPage
