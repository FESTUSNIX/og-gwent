import { CardType } from '@/types/Card'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function getFirstParamValue(param: string | string[] | undefined, fallback?: string): string | undefined {
	return (Array.isArray(param) ? param[0] : param) ?? fallback
}

export function deepEqual(object1: any, object2: any) {
	const keys1 = Object.keys(object1)
	const keys2 = Object.keys(object2)

	if (keys1.length !== keys2.length) {
		return false
	}

	for (const key of keys1) {
		const val1 = object1[key]
		const val2 = object2[key]
		const areObjects = isObject(val1) && isObject(val2)
		if ((areObjects && !deepEqual(val1, val2)) || (!areObjects && val1 !== val2)) {
			return false
		}
	}

	return true
}

export function isObject(object: any) {
	return object != null && typeof object === 'object'
}

export function getRandomEntries<T>(arr: T[], count: number): T[] {
	const shuffled = arr.sort(() => 0.5 - Math.random())
	return shuffled.slice(0, count)
}

export const capitalize = (s: string) => s && s[0].toUpperCase() + s.slice(1)

export function hashCodeOfString(str: string) {
	let hash = 0
	if (str.length === 0) return hash
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash |= 0 // Convert to 32bit integer
	}
	return hash
}

export function getRandomItemBasedOnCode<T>(arr: T[], inputCode: string): T {
	const hashCode = hashCodeOfString(inputCode)
	return arr[Math.abs(hashCode) % arr.length]
}

export const sortCards = (cards: CardType[]) => {
	return cards.sort((a, b) => {
		if (a.strength === b.strength) {
			if (a.name < b.name) return -1
			if (a.name > b.name) return 1
			return 0
		}

		if (a.strength === undefined) return -1
		if (b.strength === undefined) return 1

		return a.strength - b.strength
	})
}
