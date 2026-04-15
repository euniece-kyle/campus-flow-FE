import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingComponent } from './booking';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DatePipe } from '@angular/common';

describe('BookingComponent', () => {
  let component: BookingComponent;
  let fixture: ComponentFixture<BookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [DatePipe]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});