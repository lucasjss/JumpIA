import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionSection } from './mission-section';

describe('MissionSection', () => {
  let component: MissionSection;
  let fixture: ComponentFixture<MissionSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissionSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MissionSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
