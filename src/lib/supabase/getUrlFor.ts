import { supabase } from './supabase'

export const urlFor = (bucket: string, filepath: string) => {
	const client = supabase()

	const { data } = client.storage.from(bucket).getPublicUrl(`${filepath}`)

	return data
}
