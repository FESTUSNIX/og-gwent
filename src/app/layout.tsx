import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-body' })

export const metadata: Metadata = {
	title: 'Gwent Multiplayer'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en' className='dark'>
			<body className={inter.variable}>
				{children}
				<Toaster />
			</body>
		</html>
	)
}
