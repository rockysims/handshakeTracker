import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Point from 'ol/geom/Point.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style.js';
import {Modify} from 'ol/interaction.js';
import {Observable} from "rxjs";
import {debounceTime} from "rxjs/operators";

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.less']
})
export class MapComponent implements OnInit {
	feature;
	map;

	@Output() private markerChange = new EventEmitter<LatLong>();

	constructor() {}

	ngOnInit() {
		const feature = new Feature(new Point([0, 0]));
		this.feature = feature;

		const markerSource = new VectorSource({
			features: [feature]
		});

		const styleCache = {};
		const markerLayer = new VectorLayer({
			source: markerSource,
			style: function(feature) {
				const age = 0;
				let style = styleCache[age];
				if (!style) {
					style = new Style({
						image: new CircleStyle({
							radius: 10,
							stroke: new Stroke({
								color: '#fff'
							}),
							fill: new Fill({
								color: '#3399CC'
							})
						}),
						text: new Text({
							text: age.toString(),
							fill: new Fill({
								color: '#fff'
							})
						})
					});
					styleCache[age] = style;
				}
				return style;
			}
		});

		const raster = new TileLayer({
			source: new OSM()
		});

		const view = new View({
			projection: 'EPSG:4326',
			center: [0, 0],
			zoom: 2
		});

		const map = new Map({
			layers: [raster, markerLayer],
			target: 'map',
			view: view
		});
		this.map = map;

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
			debounceTime(300)
		).subscribe(loc => this.markerChange.emit(loc));
	}

	set(loc: LatLong) {
		this.feature.getGeometry().setCoordinates([loc.longitude, loc.latitude]);

		this.map.setView(new View({
			projection: 'EPSG:4326',
			center: this.feature.getGeometry().getCoordinates(),
			zoom: 15
		}));
	}
}
