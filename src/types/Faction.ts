import { FACTIONS } from '@/constants/FACTIONS'

export type FactionType = Pick<(typeof FACTIONS)[number], 'slug'>['slug']
