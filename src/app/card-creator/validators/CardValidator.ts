import { ABILITIES } from '@/constants/ABILITIES'
import { FACTIONS } from '@/constants/FACTIONS'
import { ROW_TYPES } from '@/constants/ROW_TYPES'
import { FactionType } from '@/types/Faction'
import { z } from 'zod'

const FactionsEnum: [FactionType, ...FactionType[]] = [FACTIONS[0].slug, ...FACTIONS.slice(1).map(f => f.slug)]

export const CardValidator = z.object({
	name: z.string(),
	type: z.enum(['unit', 'special', 'hero', 'weather']),
	faction: z.enum([...FactionsEnum]),
	strength: z.number().optional(),
	row: z.enum([...ROW_TYPES]).nullable(),
	ability: z.enum([...ABILITIES]).nullable(),
	description: z.string().optional(),
	image: z.instanceof(File).optional()
})

export type CardPayload = z.infer<typeof CardValidator>
