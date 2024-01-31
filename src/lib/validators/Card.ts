import { ABILITIES } from '@/constants/ABILITIES'
import { FACTIONS } from '@/constants/FACTIONS'
import { ROW_TYPES } from '@/constants/ROW_TYPES'
import { FactionType } from '@/types/Faction'
import { z } from 'zod'

const FactionsEnum: [FactionType, ...FactionType[]] = [FACTIONS[0].slug, ...FACTIONS.slice(1).map(f => f.slug)]

export const CardValidator = z.object({
	slug: z.string(),
	name: z.string().min(2),
	type: z.enum(['unit', 'special', 'hero', 'weather']),
	factions: z.array(z.enum([...FactionsEnum])).min(1),
	strength: z.number().min(0).optional(),
	row: z.enum([...ROW_TYPES]).optional(),
	ability: z.enum([...ABILITIES]).optional(),
	description: z.string().optional(),
	group: z.string().optional(),
	amount: z.number().min(1).optional()
})

export type CardPayload = z.infer<typeof CardValidator>
