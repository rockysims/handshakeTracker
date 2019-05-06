import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UniqueIdService} from "../unique-id.service";
import * as moment from "moment";
import {Moment} from "moment";
declare var $: any;

@Component({
	selector: 'app-date-range-slider',
	templateUrl: './date-range-slider.component.html',
	styleUrls: ['./date-range-slider.component.less']
})
export class DateRangeSliderComponent implements OnInit, AfterViewInit {
	public sliderElemId: string;
	private dateRangeSlider: any;
	private startDate: Moment;
	private endDate: Moment;

	@Input() private dateBounds: DateBounds;
	@Output() private change = new EventEmitter<DateBounds>();

	constructor(private uniqueIdService: UniqueIdService) {
		this.sliderElemId = 'slider'+uniqueIdService.next();
	}

	ngOnInit() {}

	ngAfterViewInit() {
		const period = {
			start: moment(this.dateBounds.min),
			end: moment(this.dateBounds.max)
		};
		this.startDate = period.end.diff(period.start, 'month') < 2
			? moment(period.end).add(-2, 'month').startOf('month')
			: period.start.startOf('month');
		this.endDate = moment(period.end);

		this.dateRangeSlider = $(`#${this.sliderElemId}`).dateRangeSlider({
			bounds: {
				min: this.startDate,
				max: this.endDate,
			},
			defaultValues: {
				min: this.startDate,
				max: this.endDate
			}
		});

		this.dateRangeSlider.bind("valuesChanged", (e, data) => {
			const {min, max} = data.values;
			this.change.emit({min, max});
		});

		// $('.ui-rangeSlider-bar').css('opacity', 0.9);

		this.setEntryMarks([]);
	}

	setEntryMarks(unixTimestamps: number[]) {
		unixTimestamps.sort((a, b) => a - b); //lowest to highest
		console.log('setEntryMarks() unixTimestamps: ', unixTimestamps);

		const rulerUnit = moment(this.endDate).diff(this.startDate, 'month') > 12
			? 'year'
			: 'month';
		const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		let stampIndex = 0;
		this.dateRangeSlider.dateRangeSlider({
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
					if (stampIndex < unixTimestamps.length) {
						return moment.unix(unixTimestamps[stampIndex++]);
					} else {



						//TODO: try to find better way to not show it
						return moment(this.endDate).add(1, 'day'); //don't show it



					}
				},
				end: (value) => { return value; },
				next: () => {
					if (stampIndex < unixTimestamps.length) {
						return moment.unix(unixTimestamps[stampIndex++]);
					} else {



						//TODO: try to find better way to not show it
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
		})
	}
}
