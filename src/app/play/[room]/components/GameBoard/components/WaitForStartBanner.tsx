
type Props = {}

export const WaitForStartBanner = (props: Props) => {
	return (
		<div className='fixed inset-0 z-50 flex h-full w-full items-center justify-center bg-black/50'>
			<div className='w-full bg-black py-3 text-center'>
				<p className='text-3xl text-primary'>
					<span>Waiting for your opponent to reroll their cards.</span>
				</p>
			</div>
		</div>
	)
}
