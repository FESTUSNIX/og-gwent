import { Card } from '@/types/Card'

export const getCards = async (): Promise<Card[]> => {
	const res = await fetch('http://localhost:3000/api/cards', { next: { tags: ['cards'] } })

	if (!res.ok) {
		throw new Error('Failed to fetch data')
	}

	return res.json()
}
