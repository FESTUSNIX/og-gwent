import { CardValidator } from '@/lib/validators/Card'
import axios from 'axios'
import { revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'
import { z } from 'zod'

export async function GET(req: NextRequest) {
	try {
		const { data } = await axios.get('http://localhost:3004/cards')

		if (!data) return new Response('Cards not found', { status: 404 })

		return new Response(JSON.stringify(data))
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response('Invalid request data passed', { status: 422 })
		}

		return new Response('Could not fetch cards.', { status: 500 })
	}
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()

		const payload = CardValidator.parse(body)

		const {} = await axios.post('http://localhost:3004/cards', payload)

		revalidateTag('cards')

		return new Response('OK')
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response('Invalid request data passed', { status: 422 })
		}

		return new Response('Could not add a new card.', { status: 500 })
	}
}
