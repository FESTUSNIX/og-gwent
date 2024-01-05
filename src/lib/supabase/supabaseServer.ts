'use server'

import { Database } from '@/types/supabase'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const supabaseServer = () => {
	cookies().getAll() // Keep cookies in the JS execution context for Next.js build
	return createServerComponentClient<Database>({ cookies })
}
