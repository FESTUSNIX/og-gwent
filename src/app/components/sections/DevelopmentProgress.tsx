import { Checkbox } from '@/components/ui/checkbox'
import { H2 } from '@/components/ui/Typography/H2'
import { H3 } from '@/components/ui/Typography/H3'
import { Muted } from '@/components/ui/Typography/Muted'

type Props = {}

export const DevelopmentProgress = (props: Props) => {
	return (
		<section className='py-32'>
			<div>
				<H2 className=''>About the project</H2>
				<Muted className='max-w-prose text-pretty'>
					This is a fan-made multiplayer version of Gwent from The Witcher 3. I don't have the time and resources to
					develop this project further, {/* I'm not opensourcing it*/} but if you're interested in continuing the
					project, feel free to reach out to me at{' '}
				</Muted>

				<Muted className='mt-6 max-w-prose text-pretty'>
					<b>Disclaimer:</b> This project is not affiliated with CD Projekt Red or The Witcher franchise. It is a
					non-commercial fan project. All rights to the original game and its assets belong to their respective owners.
				</Muted>
			</div>

			<div className='mt-12 grid grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-2 lg:gap-x-16 xl:gap-x-24'>
				<div>
					<H3 className='mb-4'>Already Implemented</H3>

					<ul className='space-y-2'>
						{IMPLEMENTED.map((item, index) => (
							<li
								key={index}
								className='items-top flex space-x-2 rounded-md border bg-background/10 px-4 py-4 backdrop-blur-sm'>
								<Checkbox checked id={`implemented-${index}`} />
								<div className='grid gap-1.5 leading-none'>
									<label
										htmlFor={`implemented-${index}`}
										className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
										{item.title}
									</label>
									<p className='text-sm text-muted-foreground'>{item.description}</p>
								</div>
							</li>
						))}
					</ul>
				</div>

				<div>
					<H3 className='mb-4'>To-Do</H3>

					<ul className='space-y-2'>
						{TODO.map((item, index) => (
							<li
								key={index}
								className='items-top flex space-x-2 rounded-md border bg-background/10 px-4 py-4 backdrop-blur-sm'>
								<Checkbox checked={false} id={`todo-${index}`} />
								<div className='grid gap-1.5 leading-none'>
									<label
										htmlFor={`todo-${index}`}
										className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
										{item.title}
									</label>
									<p className='text-sm text-muted-foreground'>{item.description}</p>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	)
}

const IMPLEMENTED: { title: string; description: string }[] = [
	{
		title: 'Core Mechanics',
		description:
			'Play unit cards, use special cards (weather, scorch, etc.), and battle through the best-of-three round system.'
	},
	{
		title: 'Factions & Abilities',
		description: 'Play as Northern Realms, Nilfgaard, Scoiatael and Monsters with unique faction abilities.'
	},
	{
		title: 'Matchmaking & Lobbies',
		description: 'Play against random opponents or invite friends via lobby code.'
	},
	{
		title: 'Stats Tracking',
		description: 'Your wins, losses, and streaks are saved.'
	},
	{
		title: 'Animations & Effects',
		description: 'Card interactions have animations. (Although some are still missing and buggy.)'
	}
]

const TODO: { title: string; description: string }[] = [
	{
		title: 'Leader Cards',
		description: 'Not implemented yet.'
	},
	{
		title: 'Card Bugs',
		description: 'Some cards disappear or behave incorrectly.'
	},
	{
		title: 'Crashes & Stability',
		description: 'Occasional crashes still need fixing.'
	},
	{
		title: 'Sound Effects',
		description: 'No sound design yet.'
	},
	{
		title: 'Mobile Support',
		description: 'The game only works on PC (no mobile responsiveness).'
	}
]
