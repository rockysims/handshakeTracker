import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {shareReplay, take} from "rxjs/operators";

@Injectable({
	providedIn: 'root'
})
export class RxService {
	constructor() {}

	latest<T>(s: Observable<T>|Subject<T>|BehaviorSubject<T>): Promise<T> {
		return s.pipe(
			shareReplay(1),
			take(1)
		).toPromise()
	}
}