'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { mergeRefs } from '@/lib/utils'
import { Ability } from '@/types/Ability'
import { CardType } from '@/types/Card'
import { FactionType } from '@/types/Faction'
import { RowType } from '@/types/RowType'
import { useToPng } from '@hugocxl/react-to-image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import slugify from 'react-slugify'
import { toast } from 'sonner'
import { Card } from './Card'
import { CardTitlShell } from './CardTitlShell'

type Props = {
	searchParams: { [key: string]: string | string[] | undefined }
}

export const CardPreview = ({ searchParams }: Props) => {
	const card: Omit<CardType, 'id' | 'instance' | 'amount' | 'slug' | 'group'> & {
		image: string
	} = {
		name: searchParams.name as string,
		strength: parseInt((searchParams.strength as string) ?? 0),
		factions: [searchParams.faction] as FactionType[],
		type: searchParams.type as 'unit' | 'hero' | 'weather' | 'special',
		image: searchParams.image as string,
		ability: searchParams.ability as Ability,
		description: searchParams.description as string,
		row: searchParams.row as RowType
	}

	const router = useRouter()
	const pathname = usePathname()

	const [cardWidth, setCardWidth] = useState(0)
	const [useFrame, setUseFrame] = useState(true)

	const cardPadding = useFrame ? cardWidth * 0.042 : 0

	const [{ isLoading, isError, error }, convert, generatorRef] = useToPng<HTMLDivElement>({
		canvasWidth: 410 + cardPadding * 2,
		canvasHeight: 775 + cardPadding * 2,
		cacheBust: true,
		onSuccess: data => {
			const link = document.createElement('a')

			link.download = `${slugify(card.name)}.png`
			link.href = data
			link.click()
		},
		onError: error => toast.error(error)
	})
	const cardElement = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const updateWidth = () => {
			if (cardElement.current) setCardWidth(cardElement.current.offsetWidth)
		}

		window.addEventListener('resize', updateWidth)
		updateWidth() // Initial width update

		return () => {
			window.removeEventListener('resize', updateWidth)
		}
	}, [])

	const generateImage = () => convert()

	return (
		<div className='sticky bottom-8 top-8 ml-auto h-auto max-w-sm md:pl-12'>
			<div className='mb-6'>
				<div className='flex items-center space-x-2'>
					<Checkbox id='frame' checked={useFrame} onCheckedChange={checked => setUseFrame(checked as boolean)} />
					<label
						htmlFor='frame'
						className='text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
						Show frame
					</label>
				</div>
			</div>

			<CardTitlShell>
				<div
					ref={mergeRefs(cardElement, generatorRef)}
					style={{ borderRadius: `${cardPadding + 12}px`, padding: useFrame ? '4.2%' : 0 }}
					className='relative bg-black'>
					<Card card={card} className='h-auto w-full' />
				</div>
			</CardTitlShell>

			<div className='mt-4 w-full pb-6'>
				<div className='flex w-full items-center gap-2'>
					<Button
						onClick={() => router.replace(pathname, { scroll: false })}
						disabled={isLoading}
						variant={'destructive'}
						className='grow'>
						Reset
					</Button>
					<Button
						onClick={() => {
							generateImage()
						}}
						disabled={isLoading}
						className='grow'>
						{isLoading ? 'Downloading...' : 'Download'}
					</Button>
				</div>

				{isError && <p className='text-red-600'>{error}</p>}
			</div>
		</div>
	)
}
