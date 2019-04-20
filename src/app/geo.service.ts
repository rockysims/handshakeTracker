import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class GeoService {
	constructor() {}

	getLocation(): Promise<LatLong|null> {
		return new Promise(resolve => {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition((position) => {
					resolve({
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
					});
				}, () => resolve(null));
			} else {
				resolve(null);
			}
		});
	}

	getLocationOrDefault(): Promise<LatLong> {
		return this.getLocation().then(loc =>
			loc || this.getDefaultLocation()
		);
	}

	getDefaultLocation(): LatLong {
		return {latitude: 0, longitude: 0};
	}
}
