type Props = {
	condition: boolean
	wrapper: (children: React.ReactNode) => React.ReactNode
	children: React.ReactNode
}

export const ConditionalWrapper = ({ condition, wrapper, children }: Props) =>
	condition ? wrapper(children) : children
