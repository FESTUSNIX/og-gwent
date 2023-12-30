import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function getFirstParamValue(param: string | string[] | undefined, fallback?: string): string | undefined {
	return (Array.isArray(param) ? param[0] : param) ?? fallback
}
