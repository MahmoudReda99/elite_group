import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header.component';
import { FooterComponent } from './layout/footer.component';

@Component({
  selector: 'eg-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <eg-header />
    <main>
      <router-outlet />
    </main>
    <eg-footer />
  `
})
export class AppComponent {}
