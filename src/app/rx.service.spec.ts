import { TestBed } from '@angular/core/testing';

import { RxService } from './rx.service';

describe('RxService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RxService = TestBed.get(RxService);
    expect(service).toBeTruthy();
  });
});
