'use client'

import { Volume1Icon, Volume2Icon, VolumeXIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import YouTube, { YouTubeEvent, YouTubeProps } from 'react-youtube'
import { useDebounce } from 'usehooks-ts'
import { Slider } from './ui/slider'

type Props = {}

const tracks = ['i2p3fb0G2Ok', 'xHYsgJ9Kgq4', 'd7ivDOUeIK0', '8WeE9AisvMY'].sort(() => Math.random() - 0.5)

export const BackgroundMusic = (props: Props) => {
	const playerRef = useRef<YouTube>(null)
	const startingTrack = useRef(tracks[Math.floor(Math.random() * tracks.length)])

	const opts: YouTubeProps['opts'] = {
		playerVars: {
			autoplay: 1,
			playlist: tracks.join(','),
			controls: 0,
			loop: 1,
			rel: 0,
			showinfo: 0
		}
	}

	const playVideo = () => playerRef.current?.getInternalPlayer().playVideo()
	const pauseVideo = () => playerRef.current?.getInternalPlayer().pauseVideo()
	const updateVolume = (volume: number) => playerRef.current?.getInternalPlayer().setVolume(volume)

	const savedVolume = parseInt(localStorage.getItem('musicVolume') ?? '0')
	const [volume, setVolume] = useState(savedVolume)
	const debouncedVolume = useDebounce(volume, 500)

	useEffect(() => {
		updateVolume(volume)

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [volume])

	useEffect(() => {
		const isPlaying = playerRef.current?.getInternalPlayer().getPlayerState() === 1

		if (!isPlaying) playVideo()
		if (volume === 0) pauseVideo()

		localStorage.setItem('musicVolume', volume.toString())

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedVolume])

	const onReady = (e: YouTubeEvent) => {
		e.target.setVolume(savedVolume)
	}

	return (
		<div className='absolute bottom-6 right-10 z-20 w-48 max-w-full translate-y-1/2'>
			<div className='flex items-center gap-2'>
				<div>
					<span className='sr-only'>Music volume</span>
					<button
						className='p-1'
						onClick={() => {
							setVolume(prevVolume => (prevVolume === 0 ? savedVolume : 0))
						}}>
						<>
							{volume === 0 ? (
								<VolumeXIcon className='h-6 w-6' />
							) : volume < 50 ? (
								<Volume1Icon className='h-6 w-6' />
							) : (
								<Volume2Icon className='h-6 w-6' />
							)}
						</>
					</button>
				</div>

				<Slider
					defaultValue={[savedVolume]}
					max={100}
					step={1}
					value={[volume]}
					onValueChange={value => setVolume(value[0])}
					className='w-full grow'
				/>
			</div>

			<div className='sr-only'>
				<YouTube videoId={startingTrack.current} opts={opts} ref={playerRef} onReady={onReady} />
			</div>
		</div>
	)
}
