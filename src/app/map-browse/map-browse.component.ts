import {AfterViewInit, Component, EventEmitter, OnInit, Output} from '@angular/core';
import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Point from 'ol/geom/Point.js';
import {defaults as interactionDefaults} from 'ol/interaction.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style.js';
import {UniqueIdService} from "../unique-id.service";
import {Deferred} from "../my/deferred.class";

@Component({
	selector: 'app-map-browse',
	templateUrl: './map-browse.component.html',
	styleUrls: ['./map-browse.component.less']
})
export class MapBrowseComponent implements OnInit, AfterViewInit {
	public mapElemId: string;
	private viewInitDeferred = new Deferred();
	private selectedId: string|null = null;
	private features;
	private vectorSource;
	private vectorLayer;
	private map;

	@Output() private select = new EventEmitter<string|null>();
	@Output() private bounds = new EventEmitter<MapBounds>(); //TODO: change 'bounds' to 'change'

	constructor(private uniqueIdService: UniqueIdService) {
		this.mapElemId = 'map'+uniqueIdService.next();
	}

	ngOnInit() {}

	ngAfterViewInit() {
		const self = this;

		this.viewInitDeferred.resolve();

		const vectorSource = new VectorSource({
			features: []
		});
		this.vectorSource = vectorSource;

		const vectorLayer = new VectorLayer({
			source: vectorSource,
			style: function (feature) {
				const selected = feature.data.id === self.selectedId;
				// const fillColor = `hsl(0,0%,${feature.data.agePercent}%)`;
				const fillColor = '#3399CC';
				return new Style({
					image: new CircleStyle({
						radius: 6,
						stroke: new Stroke({
							color: selected ? '#f00' : '#fff',
							width: selected ? 3 : 2
						}),
						fill: new Fill({
							color: fillColor
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
		this.vectorLayer = vectorLayer;

		const raster = new TileLayer({
			source: new OSM()
		});

		const view = new View({
			projection: 'EPSG:4326',
			center: [0, 0],
			zoom: 2
		});

		const map = new Map({
			interactions: interactionDefaults({
				mouseWheelZoom: false
			} as any),
			layers: [raster, vectorLayer],
			target: this.mapElemId,
			view: view
		});
		this.map = map;

		//handle feature clicked (de/select and emit event)
		map.getViewport().addEventListener("click", function(e) {
			let firstFeature = true;
			map.forEachFeatureAtPixel(map.getEventPixel(e), function (feature, layer) {
				//ignore all except top feature (needed when multiple features overlap on clicked pixel)
				if (!firstFeature) return;
				firstFeature = false;

				const featureData = feature['data'];
				self.selectedId = (self.selectedId === featureData.id)
					? null //already selected so deselect it
					: featureData.id; //select it
				layer.changed();
				self.select.emit(self.selectedId);
			});
		});

		map.on("moveend", () => {
			const ext = map.getView().calculateExtent(map.getSize());
			const lats = [ext[1], ext[3]].sort((a, b) => a - b); //lowest to highest
			const longs = [ext[0], ext[2]].sort((a, b) => a - b); //lowest to highest
			const viewportBounds = {
				min: {
					latitude: lats[0],
					longitude: longs[0]
				},
				max: {
					latitude: lats[1],
					longitude: longs[1]
				}
			} as MapBounds;
			this.bounds.emit(viewportBounds);
		});
	}

	async setEntries(
		entries: Entry[],
		fitMapToEntries: boolean
	) {
		await this.viewInitDeferred.promise;

		this.features = entries.map(entry => {
			const agePercent = 0; //TODO: calc this (100% when > 3 months old?)

			const loc = entry.data.location;
			const feature = new Feature(new Point([loc.longitude, loc.latitude]));
			feature.data = {
				id: entry.id,
				agePercent
			};
			return feature;
		});

		this.vectorSource.clear();
		this.vectorSource.addFeatures(this.features);

		if (fitMapToEntries) this.fitMapToEntries();
	}

	async fitMapToEntries() {
		await this.viewInitDeferred.promise;

		if (this.features.length > 0) {
			this.map.getView().fit(this.vectorSource.getExtent());
			const zoom = Math.min(15, this.map.getView().getZoom()-1);
			this.map.getView().setZoom(zoom);
		}
	}
}



