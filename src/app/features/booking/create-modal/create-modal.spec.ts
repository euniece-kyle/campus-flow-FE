import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateModal } from './create-modal';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BookingService } from '../../../services/booking.service';

describe('CreateModal', () => {
  let component: CreateModal;
  let fixture: ComponentFixture<CreateModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // We add HttpClientTestingModule to fix the service error
      imports: [CreateModal, HttpClientTestingModule],
      providers: [BookingService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateModal);
    component = fixture.componentInstance;
    // Mock the inputs to prevent errors during testing
    component.roomName = 'Test Room';
    component.selectedDate = new Date().toISOString();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});