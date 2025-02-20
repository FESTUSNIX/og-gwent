'use client'

import { CardType } from '@/types/Card'
import React, { createContext, useContext, useState, ReactNode } from 'react'

export type AnimatedCardType = CardType & { ignorePreview?: boolean }

interface AnimatedCardsContextType {
	animatedCards: AnimatedCardType[]
	setAnimatedCards: React.Dispatch<React.SetStateAction<AnimatedCardType[]>>
}

const AnimatedCardsContext = createContext<AnimatedCardsContextType | undefined>(undefined)

export const AnimatedCardsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [animatedCards, setAnimatedCards] = useState<AnimatedCardType[]>([])

	return (
		<AnimatedCardsContext.Provider value={{ animatedCards, setAnimatedCards }}>
			{children}
		</AnimatedCardsContext.Provider>
	)
}

export const useAnimatedCards = (): AnimatedCardsContextType => {
	const context = useContext(AnimatedCardsContext)
	if (!context) {
		throw new Error('useAnimatedCards must be used within an AnimatedCardsProvider')
	}
	return context
}
