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
      imports: [
        ForgotPasswordComponent,
        HttpClientModule,
        ReactiveFormsModule, // <--- MAKE SURE THIS COMMA IS HERE
      ],
      providers: [provideRouter([])]
    }).compileComponents(); // <--- This line will now stop being red!
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});