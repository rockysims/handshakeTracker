interface Entry {
	id: string,
	data: EntryData
}
interface EntryData {
	name: string,
	tags: string[],
	note: string,
	unixTimestamp: number,
	location: LatLong
}
interface LatLong {
	latitude: number,
	longitude: number
}
interface MapBounds {
	min: LatLong,
	max: LatLong
}
interface DateRange {
	min: Date,
	max: Date
}