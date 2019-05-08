import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Point from 'ol/geom/Point.js';
import {defaults as interactionDefaults} from 'ol/interaction.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style.js';
import {Modify} from 'ol/interaction.js';
import {Observable} from "rxjs";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {UniqueIdService} from "../unique-id.service";

@Component({
	selector: 'app-map-location',
	templateUrl: './map-location.component.html',
	styleUrls: ['./map-location.component.less']
})
export class MapLocationComponent implements OnInit, AfterViewInit {
	public mapElemId: string;
	private defaultCenter: [number, number] = [0, 0];
	private feature;
	private map;

	@Input() private location: LatLong;
	@Input() private locationLocked: boolean = false;
	@Output() private change = new EventEmitter<LatLong>();

	constructor(private uniqueIdService: UniqueIdService) {
		this.mapElemId = 'map'+uniqueIdService.next();
	}

	ngOnInit() {}

	ngAfterViewInit() {
		const feature = new Feature(new Point(this.defaultCenter));
		this.feature = feature;

		const markerSource = new VectorSource({
			features: [feature]
		});

		const markerLayer = new VectorLayer({
			source: markerSource,
			style: function(feature) {
				return new Style({
					image: new CircleStyle({
						radius: 10,
						stroke: new Stroke({
							color: '#fff'
						}),
						fill: new Fill({
							color: '#39C'
						})
					}),
					text: new Text({
						text: '',
						fill: new Fill({
							color: '#fff'
						})
					})
				});
			}
		});

		const raster = new TileLayer({
			source: new OSM()
		});

		const view = new View({
			projection: 'EPSG:4326',
			center: this.defaultCenter,
			zoom: 2
		});

		const map = new Map({
			interactions: interactionDefaults({
				mouseWheelZoom: false
			} as any),
			layers: [raster, markerLayer],
			target: this.mapElemId,
			view: view
		});
		this.map = map;

		if (!this.locationLocked) {
			const modify = new Modify({source: markerSource});
			map.addInteraction(modify);

			new Observable<LatLong>((observer) => {
				feature.on('change',function() {
					const coords = this.getGeometry().getCoordinates();
					observer.next({
						latitude: coords[1],
						longitude: coords[0]
					});
				}, feature);
			}).pipe(
				distinctUntilChanged((a, b) => {
					return a.latitude === b.latitude
						&& a.longitude === b.longitude;
				}),
				debounceTime(300)
			).subscribe(loc => this.change.emit(loc));
		}

		if (this.location) this.set(this.location);
	}

	set(loc: LatLong) {
		this.feature.getGeometry().setCoordinates([loc.longitude, loc.latitude]);

		let zoom = this.map.getView().getZoom();
		let center = this.map.getView().getCenter();
		const isDefaultCenter = center.join() === this.defaultCenter.join();
		if (isDefaultCenter) {
			center = this.feature.getGeometry().getCoordinates();
			zoom = 15;
		}

		this.map.setView(new View({
			projection: 'EPSG:4326',
			zoom,
			center
		}));
	}

	centerAndZoom() {
		this.map.setView(new View({
			projection: 'EPSG:4326',
			zoom: 15,
			center: this.feature.getGeometry().getCoordinates()
		}));
	}
}



