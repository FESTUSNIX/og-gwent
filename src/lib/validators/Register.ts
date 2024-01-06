import { z } from 'zod'

export const RegisterValidator = z.object({
	username: z
		.string()
		.min(3, {
			message: 'Username must be at least 3 characters long'
		})
		.max(120, {
			message: 'Provided username is too long'
		}),
	email: z.string().email({
		message: 'Invalid email address'
	}),
	password: z
		.string()
		.min(1, {
			message: 'Password is required'
		})
		.max(72, {
			message: 'Password is too long'
		})
})

export type RegisterPayload = z.infer<typeof RegisterValidator>
