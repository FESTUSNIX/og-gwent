import { z } from 'zod'

export const ProfileValidator = z.object({
	id: z.string(),
	username: z.string().min(3).max(30),
	avatar_url: z.string(),
	role: z.enum(['USER', 'ADMIN'])
})

export type ProfilePayload = z.infer<typeof ProfileValidator>
