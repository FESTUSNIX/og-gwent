'use client'

import React from 'react'
import Tilt from 'react-parallax-tilt'

type Props = {
	children: React.ReactNode
}

export const CardTitlShell = ({ children }: Props) => {
	return (
		<Tilt
			tiltReverse
			glareBorderRadius={'calc(4.2% + 12px)'}
			glareEnable={true}
			glareMaxOpacity={0.2}
			glarePosition='all'
			perspective={1500}
			tiltMaxAngleX={15}
			tiltMaxAngleY={15}>
			{children}
		</Tilt>
	)
}
