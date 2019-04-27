import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapBrowseComponent } from './map-browse.component';

describe('MapBrowseComponent', () => {
  let component: MapBrowseComponent;
  let fixture: ComponentFixture<MapBrowseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapBrowseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapBrowseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
