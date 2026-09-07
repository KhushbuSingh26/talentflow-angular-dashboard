import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddCandidate } from './add-candidate';

describe('AddCandidate', () => {
  let component: AddCandidate;
  let fixture: ComponentFixture<AddCandidate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCandidate],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCandidate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
