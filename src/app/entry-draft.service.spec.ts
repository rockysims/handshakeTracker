import { TestBed } from '@angular/core/testing';

import { EntryDraftService } from './entry-draft.service';

describe('EntryDraftService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EntryDraftService = TestBed.get(EntryDraftService);
    expect(service).toBeTruthy();
  });
});
