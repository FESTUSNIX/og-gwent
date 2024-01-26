import { type ClassValue, clsx } from 'clsx'
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
