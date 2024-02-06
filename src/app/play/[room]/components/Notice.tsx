'use client'

import { Dialog, DialogPortal } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { DialogContent } from '@radix-ui/react-dialog'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useNoticeContext } from '../context/NoticeContext'

const Notice = () => {
	const { noticeState, closeNotice } = useNoticeContext()
	const { show, component, noticeContent } = noticeState

	const pathname = usePathname()
	const searchParams = useSearchParams()

	const duration = noticeContent?.duration ?? 2000
	const onClose = noticeContent?.onClose

	useEffect(() => {
		closeNotice()
	}, [pathname, searchParams])

	useEffect(() => {
		let timer: NodeJS.Timeout

		const handleClose = async () => {
			if (show && duration !== 'infinite') {
				timer = setTimeout(async () => {
					closeNotice()

					onClose && (await onClose())
				}, duration)

				return
			}

			if (!show && onClose) await onClose()

			return () => {
				clearTimeout(timer)
			}
		}

		handleClose()

		return () => {
			clearTimeout(timer)
		}
	}, [show])

	if (component) return component

	return (
		<Dialog
			open={show}
			onOpenChange={open => {
				if (!open) closeNotice()
			}}>
			<DialogPortal>
				<DialogContent
					className={cn(
						'fixed left-[50%] top-[50%] z-50 flex h-36 w-full translate-x-[-50%] translate-y-[-50%] items-center bg-black/90 shadow-lg',
						'!duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
						noticeContent?.className
					)}>
					<div className='relative ml-[45%] h-full py-8'>
						{noticeContent?.image && (
							<div className='absolute -top-2/3 left-0 h-[200%] w-max -translate-x-full'>
								<Image
									src={noticeContent?.image}
									alt=''
									width={500}
									height={400}
									className='h-full w-full object-contain'
								/>
							</div>
						)}
						<h2 className='text-3xl font-bold text-primary'>{noticeContent?.title}</h2>
						{noticeContent?.description && (
							<p className='mt-1 text-lg text-muted-foreground'>{noticeContent?.description}</p>
						)}
					</div>
				</DialogContent>
			</DialogPortal>
		</Dialog>
	)
}

export default Notice
