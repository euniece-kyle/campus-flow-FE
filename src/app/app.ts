import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  // This line replaces the need for app.html
  template: `<router-outlet></router-outlet>`, 
  styles: []
})
export class AppComponent {}