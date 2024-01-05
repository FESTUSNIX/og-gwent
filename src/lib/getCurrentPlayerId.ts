'use client'

export const getCurrentPlayerId = () => {
	const localStoragePlayerId = localStorage.getItem('playerId')
	if (localStoragePlayerId === null) throw new Error('No playerId in localStorage')

	return parseInt(localStoragePlayerId)
}
