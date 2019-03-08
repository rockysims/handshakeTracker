interface Entry {
	id: string,
	data: EntryData
}
interface EntryData {
	name: string,
	tags: string[],
	note: string,
	unixTimestamp: number,
	// location: LatLong
}
interface LatLong {
	latitude: number,
	longitude: number
}