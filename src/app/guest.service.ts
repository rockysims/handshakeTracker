import {Injectable} from '@angular/core';
import { Guid } from 'guid-typescript';

@Injectable({
	providedIn: 'root'
})
export class GuestService {
	public readonly id = Guid.create().toString();

	constructor() {}
}
