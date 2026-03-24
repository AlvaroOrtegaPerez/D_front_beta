import { Component, inject, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../core/services/token.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="topbar">
      <div class="topbar__left">
        <button class="topbar__hamburger" (click)="toggleMobile()" title="Menú">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <h2 class="topbar__title">{{ pageTitle }}</h2>
      </div>
      <div class="topbar__right">
        <div class="topbar__avatar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <button class="topbar__darkmode" (click)="toggleDarkMode()" title="Cambiar tema">
          @if (isDarkMode) {
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
          } @else {
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>
        <button class="topbar__logout" (click)="logout()" title="Cerrar sesión">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: 68px; display: flex; align-items: center;
      justify-content: space-between; padding: 0 32px;
      background: rgba(255,255,255,0.8); backdrop-filter: blur(12px);
      border-bottom: 1px solid #e2e8f0;
    }
    .topbar__left { display: flex; align-items: center; gap: 12px; }
    .topbar__title { font-size: 1.2rem; font-weight: 700; color: #1e293b; margin: 0; }
    .topbar__right { display: flex; align-items: center; gap: 12px; }
    .topbar__avatar {
      width: 40px; height: 40px; border-radius: 12px;
      background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(4,120,87,0.1));
      display: flex; align-items: center; justify-content: center; color: #10b981;
    }
    .topbar__logout, .topbar__darkmode {
      width: 40px; height: 40px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      color: #64748b; cursor: pointer; background: none; border: none;
      transition: background 0.2s, color 0.2s;
    }
    .topbar__logout:hover { background: rgba(239,68,68,0.08); color: #ef4444; }
    .topbar__darkmode:hover { background: rgba(16,185,129,0.08); color: #10b981; }
    .topbar__hamburger {
      display: none;
      width: 40px; height: 40px; border-radius: 10px;
      align-items: center; justify-content: center;
      color: #1e293b; cursor: pointer; background: none; border: none;
      transition: background 0.2s;
    }
    .topbar__hamburger:hover { background: rgba(0,0,0,0.04); }
    @media (max-width: 768px) {
      .topbar { padding: 0 16px; height: 56px; }
      .topbar__title { font-size: 1rem; }
      .topbar__hamburger { display: flex; }
      .topbar__avatar { width: 36px; height: 36px; border-radius: 10px; }
      .topbar__logout, .topbar__darkmode { width: 36px; height: 36px; }
    }
  `]
})
export class TopbarComponent {
  private tokenService = inject(TokenService);
  private router = inject(Router);

  @Input() mobileOpen = false;
  @Output() mobileOpenChange = new EventEmitter<boolean>();

  pageTitle = 'Dinamiza ECO 360';
  isDarkMode = false;

  ngOnInit() {
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', String(this.isDarkMode));
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  toggleMobile(): void {
    this.mobileOpen = !this.mobileOpen;
    this.mobileOpenChange.emit(this.mobileOpen);
  }

  logout(): void {
    this.tokenService.clearToken();
    this.router.navigateByUrl('/login');
  }
}
