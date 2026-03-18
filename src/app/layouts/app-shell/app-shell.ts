import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar';
import { TopbarComponent } from '../topbar/topbar';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="shell" [class.shell--collapsed]="collapsed">
      <app-sidebar
        [collapsed]="collapsed"
        [mobileOpen]="mobileOpen"
        (collapsedChange)="collapsed = $event"
        (mobileOpenChange)="mobileOpen = $event" />
      <div class="shell__main">
        <app-topbar [mobileOpen]="mobileOpen" (mobileOpenChange)="mobileOpen = $event" />
        <div class="shell__content">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .shell { display: flex; min-height: 100vh; background: #f8fafc; }
    .shell__main {
      flex: 1; margin-left: 260px;
      transition: margin-left 0.3s cubic-bezier(0.16,1,0.3,1);
      min-width: 0;
    }
    .shell--collapsed .shell__main { margin-left: 72px; }
    .shell__content {
      padding: 32px;
      min-height: calc(100vh - 68px);
      overflow-x: hidden;
    }
    @media (max-width: 1024px) {
      .shell__main { margin-left: 72px !important; }
      .shell__content { padding: 24px; }
    }
    @media (max-width: 768px) {
      .shell__main { margin-left: 0 !important; }
      .shell__content { padding: 16px 12px; min-height: calc(100vh - 56px); }
    }
  `]
})
export class AppShellComponent {
  collapsed = false;
  mobileOpen = false;
}
