'use client'

export const getCurrentPlayerId = () => {
	const localStoragePlayerId = localStorage.getItem('playerId')
	const sessionStoragePlayerId = sessionStorage.getItem('playerId')

	if (localStoragePlayerId === null) throw new Error('No playerId in localStorage')

	return parseInt(sessionStoragePlayerId ?? localStoragePlayerId)
}
