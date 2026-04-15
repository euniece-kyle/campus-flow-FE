import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router'; 
import { ForgotPasswordComponent } from './forgot-password';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // 1. Add these standard Angular imports
      imports: [
        ForgotPasswordComponent, 
        HttpClientModule, 
        ReactiveFormsModule
      ],
      // 2. Keep your existing router provider
      providers: [provideRouter([])] 
    }).compileComponents();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});