import { BoardRowTypes } from "./RowType"

export type WeatherEffect = 'frost' | 'fog' | 'rain'

export const ROW_TO_WEATHER_EFFECT: Record<BoardRowTypes, WeatherEffect> = {
	melee: 'frost',
	range: 'fog',
	siege: 'rain'
}
