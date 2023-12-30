'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandGroup, CommandItem } from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { Command as CommandPrimitive } from 'cmdk'
import { ChevronDown, X } from 'lucide-react'
import * as React from 'react'

interface MultiSelectProps {
	disabled?: boolean
	selected: string[] | null
	setSelected: (value: string[] | null) => void
	onChange?: (value: string[] | null) => void
	placeholder?: string
	options: Option[]
}

type Option = {
	label: string
	value: string
}

export function MultiSelect({
	disabled,
	selected,
	setSelected,
	onChange,
	placeholder = 'Select options',
	options
}: MultiSelectProps) {
	const inputRef = React.useRef<HTMLInputElement>(null)
	const [isOpen, setIsOpen] = React.useState(false)
	const [query, setQuery] = React.useState('')

	// Register as input field to be used in react-hook-form
	React.useEffect(() => {
		if (onChange) onChange(selected?.length ? selected : null)
	}, [onChange, selected])

	const handleSelect = React.useCallback(
		(option: string) => {
			setSelected([...(selected ?? []), option])
		},
		[setSelected, selected]
	)

	const handleRemove = React.useCallback(
		(option: string) => {
			setSelected(selected?.filter(item => item !== option) ?? [])
		},
		[setSelected, selected]
	)

	const handleKeyDown = React.useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>) => {
			if (!inputRef.current) return

			if (event.key === 'Backspace' || event.key === 'Delete') {
				setSelected(selected?.slice(0, -1) ?? [])
			}

			// Blur input on escape
			if (event.key === 'Escape') {
				inputRef.current.blur()
			}
		},
		[setSelected, selected]
	)

	// Memoize filtered options to avoid unnecessary re-renders
	const filteredOptions = React.useMemo(() => {
		return options.filter(option => {
			if (selected?.find(item => item === option.value)) return false

			if (query.length === 0) return true

			return option.label.toLowerCase().includes(query.toLowerCase())
		})
	}, [options, query, selected])

	return (
		<Command onKeyDown={handleKeyDown} className='overflow-visible bg-transparent'>
			<div className='group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'>
				<div className='relative flex grow flex-wrap gap-1 pr-4'>
					{options
						.filter(o => selected?.includes(o.value))
						?.map(option => {
							return (
								<Badge key={option.value} variant='secondary' className='rounded hover:bg-secondary'>
									{option.label}
									<Button
										aria-label='Remove option'
										size='sm'
										className='ml-2 h-auto bg-transparent p-0 text-primary hover:bg-transparent hover:text-destructive'
										onKeyDown={e => {
											if (e.key === 'Enter') {
												e.preventDefault()
												e.stopPropagation()
												handleRemove(option.value)
											}
										}}
										onMouseDown={e => {
											e.preventDefault()
											e.stopPropagation()
										}}
										onClick={() => handleRemove(option.value)}>
										<X className='h-3 w-3' aria-hidden='true' />
									</Button>
								</Badge>
							)
						})}
					<CommandPrimitive.Input
						ref={inputRef}
						placeholder={placeholder}
						className={cn(
							'flex-1 bg-transparent px-1 py-0.5 outline-none placeholder:text-muted-foreground',
							disabled && 'opacity-50'
						)}
						value={query}
						disabled={disabled}
						onValueChange={setQuery}
						onBlur={() => setIsOpen(false)}
						onFocus={() => setIsOpen(true)}
					/>
					<ChevronDown className='pointer-events-none absolute right-0 top-1/2 h-4 w-4 shrink-0 -translate-y-1/2 select-none opacity-50' />
				</div>
			</div>
			<div className='relative z-50 mt-2'>
				{isOpen && filteredOptions.length > 0 ? (
					<div className='absolute top-0 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in'>
						<CommandGroup className='h-full max-h-48 overflow-auto '>
							{filteredOptions.map(option => {
								return (
									<CommandItem
										key={option.value}
										className='px-2 py-1.5 text-sm'
										onMouseDown={e => {
											e.preventDefault()
											e.stopPropagation()
										}}
										onSelect={() => {
											handleSelect(option.value)
											setQuery('')
										}}>
										{option.label}
									</CommandItem>
								)
							})}
						</CommandGroup>
					</div>
				) : null}
			</div>
		</Command>
	)
}
