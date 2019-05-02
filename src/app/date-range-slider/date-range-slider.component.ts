import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UniqueIdService} from "../unique-id.service";
import * as moment from "moment";
declare var $: any;

@Component({
	selector: 'app-date-range-slider',
	templateUrl: './date-range-slider.component.html',
	styleUrls: ['./date-range-slider.component.less']
})
export class DateRangeSliderComponent implements OnInit, AfterViewInit {
	public sliderElemId: string;

	@Input() private startDate: Date;
	@Output() private change = new EventEmitter<DateBounds>();

	constructor(private uniqueIdService: UniqueIdService) {
		this.sliderElemId = 'slider'+uniqueIdService.next();
	}

	ngOnInit() {}

	ngAfterViewInit() {
		const period = {
			start: moment().add(-12, 'month'),
			end: moment()
		};



		const startDate = period.end.diff(period.start, 'month') < 2
			? moment(period.end).add(-2, 'month')
			: period.start;
		const endDate = moment(period.end);

		const rulerUnit = moment(endDate).diff(startDate, 'month') > 12
			? 'year'
			: 'month';
		const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		$(`#${this.sliderElemId}`).dateRangeSlider({
			bounds: {
				min: startDate,
				max: endDate,
			},
			defaultValues: {
				min: endDate, //TODO: change to startDate
				max: endDate
			},
			scales: [{
				first: function(value) {
					return moment(value).add(1, rulerUnit).startOf(rulerUnit);
				},
				next: function(value) {
					return moment(value).add(1, rulerUnit).startOf(rulerUnit);
				},
				label: function(value) {
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
			},
			// {
			// 	first: function(value) { return value; },
			// 	end: function(value) { return value; },
			// 	next: function(value) {
			// 		return moment(value).add(Math.floor(Math.random() * 15), 'day');
			// 	},
			// 	label: function(value) {
			// 		return '';
			// 	},
			// 	format: function(tickContainer, tickStart, tickEnd) {
			// 		const span = tickContainer.find('div.ui-ruler-tick-inner');
			// 		// span.css('border-width', '2px');
			// 		span.css('border-color', '#fff');
			// 		span.css('margin-top', '28px');
			// 		span.css('position', 'relative');
			// 		// span.css('z-index', '2');
			// 	}
			// }
			]
		});

		// $('.ui-rangeSlider-bar').css('opacity', 0.9);
	}
}
