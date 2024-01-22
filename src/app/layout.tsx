import Providers from '@/components/Providers'
import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import localFont from 'next/font/local'

const body = Outfit({ subsets: ['latin'], variable: '--font-body' })
const heading = localFont({
	src: '../../public/fonts/gwent_extrabold.ttf',
	variable: '--font-heading'
})

export const metadata: Metadata = {
	title: 'Gwent Multiplayer'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en' className='dark'>
			<body className={`${body.variable} ${heading.variable}`}>
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
