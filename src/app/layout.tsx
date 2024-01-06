import Providers from '@/components/Providers'
import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'

const body = Outfit({ subsets: ['latin'], variable: '--font-body' })

export const metadata: Metadata = {
	title: 'Gwent Multiplayer'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en' className='dark'>
			<body className={body.variable}>
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
