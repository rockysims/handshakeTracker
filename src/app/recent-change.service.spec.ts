import { TestBed } from '@angular/core/testing';

import { RecentChangeService } from './recent-change.service';

describe('RecentChangeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RecentChangeService = TestBed.get(RecentChangeService);
    expect(service).toBeTruthy();
  });
});
