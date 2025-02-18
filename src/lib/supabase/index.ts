import { createClient } from './client'

export const urlFor = (bucket: string, filepath: string) => {
	const supabase = createClient()
	const { data } = supabase.storage.from(bucket).getPublicUrl(`${filepath}`)

	return data
}
