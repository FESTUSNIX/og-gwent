import { Database } from '@/types/supabase'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
	// Create a supabase client on the browser with project's credentials
	return createBrowserClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
	)
}

export const getUserSession = async () => {
	const supabase = createClient()

	const { data, error } = await supabase.auth.getSession()
	return data.session
}

export async function signOut() {
	const supabase = createClient()
	const { error } = await supabase.auth.signOut()

	if (error) throw new Error(error.message)
}
