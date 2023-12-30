import { FACTIONS } from '@/constants/FACTIONS'
import { ROW_TYPES } from '@/constants/ROW_TYPES'
import { FactionType } from '@/types/Faction'
import { z } from 'zod'

const FactionsEnum: [FactionType, ...FactionType[]] = [FACTIONS[0].slug, ...FACTIONS.slice(1).map(f => f.slug)]

export const CardValidator = z.object({
	name: z.string().min(2),
	strength: z.number().min(0).max(15),
	type: z.enum([...ROW_TYPES]),
	factions: z.array(z.enum([...FactionsEnum])).min(1),
	isHero: z.boolean()
})
