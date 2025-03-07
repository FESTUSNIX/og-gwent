import useGameContext from '@/app/play/[room]/hooks/useGameContext'
import { Card } from '@/components/Card'
import { cn, getVw } from '@/lib/utils'
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
		actions: { removeFromContainer, clearPreview, setTurn, addToContainer, setGameState }
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

		const card = { ...cardToAdd, owner: host.id }
		const currentEffects = gameState.weatherEffects ?? []

		if (card.type !== 'weather') return
		if (card.ability === 'clear_weather') {
			setGameState({
				...gameState,
				weatherEffects: []
			})
			;[...currentEffects, card].map(effect => {
				addToContainer(effect.owner, [effect], 'discardPile')
			})

			cleanAfterPlay(cardToAdd)
			return
		}

		setGameState({
			...gameState,
			weatherEffects: [...(currentEffects?.filter(w => w.id !== card.id) ?? []), card]
		})

		// Keep in mind that multiple cards can be replaced when playing a skellige storm - TODO: Skellige
		const effectsToReplace = currentEffects.filter(effect => effect.ability === card.ability)

		effectsToReplace.map(effect => {
			addToContainer(effect.owner, [effect], 'discardPile')
		})

		cleanAfterPlay(cardToAdd)
	}

	return (
		<div
			className='relative w-full bg-no-repeat px-[4%] py-[5%] shadow-[4px_8px_6px_#00000070,-2px_-2px_12px_#00000050] [background-size:100%_100%]'
			style={{ backgroundImage: `url('/game/board/weather_slots.png')` }}>
			<button
				className={cn(
					'flex aspect-[2/1] h-full w-full cursor-auto items-center justify-center p-[1.5%]',
					canPlayWeather && 'ring-4 ring-inset ring-yellow-600/50 hover:ring-yellow-600'
				)}
				style={{ gap: getVw(4) }}
				onClick={() => {
					handlePlayWeather()
				}}>
				{weatherEffects?.map(card => (
					<Card key={card.id} card={card} mode='game' useLayoutAnimation className='max-w-[33%]' />
				))}
			</button>
		</div>
	)
}
