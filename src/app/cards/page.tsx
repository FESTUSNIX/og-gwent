import { Card } from '@/components/Card'
import { CARDS } from '@/constants/CARDS'
import React from 'react'
import { CardCreator } from './components/CardCreator'

type Props = {}

const CardsPage = (props: Props) => {
	return (
		<main className='grid-container pt-12'>
			<h1 className='text-4xl'>Gwent cards</h1>

			<section className='my-16'>
				<div className='mb-8 flex items-center justify-between'>
					<h2 className='text-2xl'>All cards</h2>

					<CardCreator />
				</div>

				<ul className='grid grid-cols-6 gap-4'>
					{CARDS.map(card => (
						<Card key={card.id} card={card} mode='preview' />
					))}
				</ul>
			</section>
		</main>
	)
}

export default CardsPage
