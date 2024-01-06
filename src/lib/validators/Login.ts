import { z } from 'zod'

export const LoginValidator = z.object({
	email: z.string().email({
		message: 'Invalid email address'
	}),
	password: z.string().nonempty({
		message: 'Password is required'
	})
})

export type LoginPayload = z.infer<typeof LoginValidator>
