import { TestBed, async, inject } from '@angular/core/testing';

import { LoginRouteGuard } from './login-route.guard';

describe('LoginRouteGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoginRouteGuard]
    });
  });

  it('should ...', inject([LoginRouteGuard], (guard: LoginRouteGuard) => {
    expect(guard).toBeTruthy();
  }));
});
