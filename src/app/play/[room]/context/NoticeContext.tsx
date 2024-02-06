'use client'

import React, { createContext, useContext, useEffect, useReducer, useState } from 'react'
import Notice from '../components/Notice'

type NoticeContent = {
	title?: string
	description?: string
	image?: string
	onClose?: () => Promise<void> | void
	duration?: number | 'infinite'
	className?: string
}

type NoticeState = {
	show: boolean
	noticeContent: NoticeContent | null
	component?: JSX.Element
}

export type NOTICE_TYPES = 'CUSTOM' | 'CLOSE'

const defaultState: NoticeState = {
	show: false,
	noticeContent: null,
	component: undefined
}

const noticeReducer = (
	state: any,
	action: { type: NOTICE_TYPES; noticeContent?: NoticeContent; component?: JSX.Element }
) => {
	const noticeContent: NoticeContent | null = action.noticeContent ?? null

	switch (action.type) {
		case 'CUSTOM':
			return {
				noticeContent,
				component: action.component,
				show: true
			}
		case 'CLOSE':
			return {
				...state,
				show: false
			}
	}
}

type NoticeContext = {
	notice: (noticeContent?: NoticeContent, component?: JSX.Element) => Promise<void>
	closeNotice: () => void
	noticeState: NoticeState
	isResolving: boolean
}

const initialState: NoticeContext = {
	notice: () => Promise.resolve(),
	closeNotice: () => {},
	noticeState: defaultState,
	isResolving: false
}

const NoticeContext = createContext(initialState)

export const NoticeProvider = ({ children }: { children: React.ReactNode }) => {
	const [noticeState, noticeDispatch] = useReducer(noticeReducer, defaultState)
	const [resolveShow, setResolveShow] = useState<(() => void) | null>(null)
	const [isResolving, setIsResolving] = useState(false)

	useEffect(() => {
		if (!noticeState.show && resolveShow) {
			resolveShow()
			setResolveShow(null)
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [noticeState.show])

	const notice = (noticeContent?: NoticeContent, component?: JSX.Element) => {
		return new Promise<void>(resolve => {
			setResolveShow(() => {
				setIsResolving(true) // Set isResolving to true before resolving
				return () => {
					setIsResolving(false) // Set isResolving to false after resolving
					resolve()
				}
			})
			noticeDispatch({
				type: 'CUSTOM',
				noticeContent,
				component
			})
		})
	}

	const closeNotice = () => {
		noticeDispatch({
			type: 'CLOSE'
		})
	}

	return (
		<NoticeContext.Provider value={{ noticeState, isResolving, notice, closeNotice }}>
			{children}
			<Notice />
		</NoticeContext.Provider>
	)
}

export const useNoticeContext = () => {
	const context = useContext(NoticeContext)

	if (!context) {
		console.log('useNoticeContext must be used inside an NoticeContext')
		throw Error('useNoticeContext must be used inside an NoticeContext')
	}

	return context
}
