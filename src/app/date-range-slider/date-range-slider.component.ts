import {AfterViewInit, Component, EventEmitter, NgZone, OnInit, Output} from '@angular/core';
import {UniqueIdService} from "../unique-id.service";
import {Deferred} from "../my/deferred.class";
import {Moment} from "moment";
import * as moment from "moment";
declare var $: any;

@Component({
	selector: 'app-date-range-slider',
	templateUrl: './date-range-slider.component.html',
	styleUrls: ['./date-range-slider.component.less']
})
export class DateRangeSliderComponent implements OnInit, AfterViewInit {
	public sliderElemId: string;
	private dateRangeSliderDeferred = new Deferred<any>();
	private startDate: Moment = moment();
	private endDate: Moment = moment();
	private unixTimestamps: number[] = [];

	@Output() private change = new EventEmitter<DateRange>();

	constructor(private uniqueIdService: UniqueIdService,
				private ngZone: NgZone) {
		this.sliderElemId = 'slider'+uniqueIdService.next();
	}

	ngOnInit() {}

	ngAfterViewInit() {
		this.startDate = moment().add(-12, 'month').startOf('month');
		this.endDate = moment();
		const defaultBounds = {
			min: this.startDate,
			max: this.endDate
		};

		const dateRangeSlider = $(`#${this.sliderElemId}`).dateRangeSlider({
			bounds: defaultBounds,
			defaultValues: defaultBounds,
			formatter: val => moment(val).format('M/D/YYYY')
		});
		this.dateRangeSliderDeferred.resolve(dateRangeSlider);

		dateRangeSlider.on("valuesChanged", (e, data) => {
			const {min, max} = data.values;
			this.ngZone.run(() => {
				this.change.emit({min, max});
			});
		});

		// $('.ui-rangeSlider-bar').css('opacity', 0.9);

		this.setEntryMarks();
	}

	async setEntryMarks(unixTimestamps: number[] = null) {
		if (unixTimestamps) {
			this.unixTimestamps = unixTimestamps.sort((a, b) => a - b); //lowest to highest
		}
		const dateRangeSlider = await this.dateRangeSliderDeferred.promise;

		const rulerUnit = moment(this.endDate).diff(this.startDate, 'month') > 12
			? 'year'
			: 'month';
		const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		let stampIndex = 0;
		dateRangeSlider.dateRangeSlider({
			scales: [{
				first: (value) => {
					return moment(value).startOf(rulerUnit);
				},
				next: (value) => {
					return moment(value).add(1, rulerUnit).startOf(rulerUnit);
				},
				label: (value) => {
					const val = moment(value);
					if (rulerUnit === 'month') {
						return months[val.month()];
					} else {
						return val.year();
					}
				},
				format: function(tickContainer, tickStart, tickEnd) {
					const span = tickContainer.find('span.ui-ruler-tick-label');
					span.css('transform', 'rotate(-90deg)');
					span.css('font-size', '10px');
					// span.css('bottom', '10px');
				}
			}, {
				first: () => {
					if (stampIndex < this.unixTimestamps.length) {
						return moment.unix(this.unixTimestamps[stampIndex++]);
					} else {
						return moment(this.endDate).add(1, 'day'); //don't show it
					}
				},
				end: (value) => { return value; },
				next: () => {
					if (stampIndex < this.unixTimestamps.length) {
						return moment.unix(this.unixTimestamps[stampIndex++]);
					} else {
						return moment(this.endDate).add(1, 'day'); //don't show it
					}
				},
				label: () => {
					return '';
				},
				format: (tickContainer, tickStart, tickEnd) => {
					const span = tickContainer.find('div.ui-ruler-tick-inner');
					span.css('border-color', '#0ff');
					span.css('margin-top', '28px');
					span.css('position', 'relative');
					span.css('z-index', '2');
				}
			}]
		});
	}

	async setBounds(dateRange: DateRange, setRangeToBounds: boolean) {
		const dateRangeSlider = await this.dateRangeSliderDeferred.promise;

		const bounds = {
			start: moment(dateRange.min),
			end: moment(dateRange.max)
		};
		this.startDate = bounds.end.diff(bounds.start, 'month') < 2
			? moment(bounds.end).add(-2, 'month').startOf('month')
			: bounds.start.startOf('month');
		this.endDate = moment(bounds.end);

		dateRangeSlider.dateRangeSlider(
			"option",
			{
				bounds: {
					min: this.startDate.toDate(),
					max: this.endDate.toDate()
				}
			}
		);

		if (setRangeToBounds) {
			dateRangeSlider.dateRangeSlider("values", this.startDate.toDate(), this.endDate.toDate());
		}

		this.setEntryMarks(); //redraw entry marks
	}
}
