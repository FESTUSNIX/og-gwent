type Props = {}

export const WeatherCardSlots = (props: Props) => {
	return (
		<div className='w-full'>
			<div className='flex h-max w-full items-center justify-center border-8 bg-stone-700 p-2'>
				<div className='flex aspect-[45/60]  h-auto w-24 items-center justify-center bg-stone-800 text-center'>
					Weather Card
				</div>
			</div>
		</div>
	)
}
