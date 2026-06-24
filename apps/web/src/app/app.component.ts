import { Component } from '@angular/core';
import { WorkspaceShellComponent } from './layout/workspace-shell.component';

@Component({
  selector: 'eg-root',
  standalone: true,
  imports: [WorkspaceShellComponent],
  template: `
    <eg-workspace-shell />
  `
})
export class AppComponent {}
