import { ROW_TYPES } from '@/constants/ROW_TYPES'

export type RowType = (typeof ROW_TYPES)[number]
export type BoardRowTypes = 'melee' | 'range' | 'siege'