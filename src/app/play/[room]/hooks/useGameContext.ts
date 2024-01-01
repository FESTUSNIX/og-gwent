import { useContext } from 'react'
import { GameContext } from '../context/GameContext'

const useGameContext = () => {
	const gameContext = useContext(GameContext)

	if (!gameContext) {
		throw new Error('useGameContext must be used within a GameContextProvider')
	}

	return gameContext
}

export default useGameContext
