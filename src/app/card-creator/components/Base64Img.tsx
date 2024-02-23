import Image, { ImageProps } from 'next/image'
import { useEffect, useState } from 'react'

type Props = ImageProps

export function Base64Img({ src, alt, ...props }: Props) {
	const [blob, setBlob] = useState<string | null>(null)

	useEffect(() => {
		async function downloadAndDisplayImage() {
			if (typeof src !== 'string') return

			try {
				const response = await fetch(src)

				if (response.ok) {
					const blob = await response.blob()
					const reader = new FileReader()

					reader.onload = function () {
						const base64Data = reader.result
						setBlob(String(base64Data))
					}

					reader.readAsDataURL(blob)
				} else {
					console.error('Failed to download image')
				}
			} catch (error) {
				console.error('Error:', error)
			}
		}
		downloadAndDisplayImage()
	}, [src])

	if (!blob) {
		return null
	}
	return <Image src={blob} alt={alt} {...props} />
}
