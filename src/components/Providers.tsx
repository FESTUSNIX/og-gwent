'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from './ui/sonner'

type Props = {
	children: React.ReactNode
}

const Providers = ({ children }: Props) => {
	const [client] = useState(new QueryClient())

	return (
		<QueryClientProvider client={client}>
			{children}
			<Toaster />
		</QueryClientProvider>
	)
}

export default Providers
