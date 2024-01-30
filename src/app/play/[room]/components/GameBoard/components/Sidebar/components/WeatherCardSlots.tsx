import useGameContext from '@/app/play/[room]/hooks/useGameContext'
import { Card } from '@/components/Card'
import { cn } from '@/lib/utils'
import { CardType } from '@/types/Card'
import { GamePlayer } from '@/types/Game'

type Props = {
	host: GamePlayer
	opponent: GamePlayer
}

export const WeatherCardSlots = ({ host, opponent }: Props) => {
	const {
		gameState,
		sync,
		actions: { removeFromContainer, clearPreview, setTurn, playWeatherEffect }
	} = useGameContext()
	const { weatherEffects } = gameState

	const cardToAdd = host.preview
	const canPlayWeather = cardToAdd?.type === 'weather' && !host.hasPassed

	const cleanAfterPlay = (card?: CardType) => {
		if (card) removeFromContainer(host.id, [card], 'hand')

		clearPreview(host.id)

		if (!opponent.hasPassed) {
			setTurn(gameState.turn === host.id ? opponent.id : gameState.turn)
		}

		sync()
	}

	const handlePlayWeather = () => {
		if (!canPlayWeather) return

		playWeatherEffect(cardToAdd)

		cleanAfterPlay(cardToAdd)
	}

	return (
		<div className='w-full border-[10px] bg-stone-700 '>
			<button
				className={cn(
					'flex aspect-[2/1] h-full w-full cursor-auto items-center justify-center gap-1 p-2',
					canPlayWeather && 'cursor-pointer ring-4 ring-inset ring-yellow-600/50 hover:ring-yellow-600'
				)}
				onClick={() => {
					handlePlayWeather()
				}}>
				{weatherEffects?.map(card => (
					<Card key={card.id} card={card} mode='game' className='max-w-[33%]' />
				))}
			</button>
		</div>
	)
}
