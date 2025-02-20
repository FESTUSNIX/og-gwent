'use client'

import { Button } from '@/components/ui/button'
import { CardType } from '@/types/Card'
import { FactionType } from '@/types/Faction'
import { GamePlayer } from '@/types/Game'
import { Tables } from '@/types/supabase'
import { createId } from '@paralleldrive/cuid2'
import { toast } from 'sonner'
import { initialPlayer } from '../../../context/GameContext'
import useGameContext from '../../../hooks/useGameContext'

type Props = {
	selectedDeck: CardType[]
	accepted: boolean
	player: Pick<Tables<'profiles'>, 'id' | 'username'>
	currentFaction: FactionType
}

export const StartGameButton = ({ accepted, selectedDeck, player, currentFaction }: Props) => {
	const {
		gameState,
		sync,
		actions: { updatePlayerState, setGameState }
	} = useGameContext()

	const flattenedSelectedDeck = selectedDeck.flatMap(card =>
		Array.from({ length: card.amount ?? 1 }, () => ({ ...card, amount: 1 }))
	)
	const minDeckLength = 18

	const acceptGame = () => {
		toast(accepted ? 'Canceled accept' : 'Accepted game!')

		const newDeck: CardType[] = flattenedSelectedDeck.map(card => ({ ...card, instance: createId() }))

		const newPlayerState: GamePlayer = {
			...initialPlayer,
			gameStatus: !accepted ? 'accepted' : 'select-deck',
			faction: currentFaction,
			deck: newDeck,
			id: player.id,
			name: player.username ?? `Player ${Math.random().toString(36).slice(0, 6)}`
		}

		if (gameState.players.find(p => p.id === player.id)) {
			updatePlayerState(player.id, newPlayerState)
		} else if (gameState.players.length < 2) {
			setGameState({
				...gameState,
				players: [...gameState.players.filter(p => p.id !== player.id), newPlayerState]
			})
		}

		sync()

		if (localStorage === undefined) return

		const recentFaction = localStorage.getItem('recent-faction')
		if (recentFaction !== currentFaction) {
			localStorage.setItem('recent-faction', currentFaction)
		}
	}

	return (
		<Button size={'sm'} onClick={() => acceptGame()} disabled={flattenedSelectedDeck.length < minDeckLength}>
			{!accepted ? "I'm ready" : 'Cancel'}
		</Button>
	)
}
