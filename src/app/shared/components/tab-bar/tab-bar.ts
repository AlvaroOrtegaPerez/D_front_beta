import { Component, Input, Output, EventEmitter, ElementRef, AfterViewInit, viewChildren, effect } from '@angular/core';

@Component({
  selector: 'app-tab-bar',
  standalone: true,
  template: `
    <div class="tab-bar">
      @for (tab of tabs; track tab; let i = $index) {
        <button
          #tabBtn
          class="tab-bar__tab"
          [class.tab-bar__tab--active]="i === activeIndex"
          (click)="onTabClick(i)">
          {{ tab }}
        </button>
      }
      <div class="tab-bar__indicator"
        [style.left.px]="indicatorLeft"
        [style.width.px]="indicatorWidth"></div>
    </div>
  `,
  styles: [`
    .tab-bar {
      display: flex; gap: 4px; position: relative;
      background: rgba(241,245,249,0.8);
      border-radius: 12px; padding: 4px; margin-bottom: 24px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .tab-bar::-webkit-scrollbar { display: none; }
    .tab-bar__tab {
      flex: 1; text-align: center;
      padding: 10px 20px; border-radius: 10px; font-size: 0.9rem;
      font-weight: 600; color: #64748b; cursor: pointer;
      background: none; border: none; white-space: nowrap;
      transition: color 0.2s; position: relative; z-index: 1;
      font-family: inherit;
    }
    .tab-bar__tab--active { color: #047857; }
    .tab-bar__tab:hover:not(.tab-bar__tab--active) { color: #1e293b; }
    .tab-bar__indicator {
      position: absolute; top: 4px; height: calc(100% - 8px);
      background: white; border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: left 0.3s cubic-bezier(0.16,1,0.3,1), width 0.3s cubic-bezier(0.16,1,0.3,1);
    }
    @media (max-width: 768px) {
      .tab-bar { margin-bottom: 16px; border-radius: 10px; }
      .tab-bar__tab { padding: 8px 14px; font-size: 0.82rem; }
    }
    @media (max-width: 480px) {
      .tab-bar__tab { padding: 8px 12px; font-size: 0.78rem; }
    }
  `]
})
export class TabBarComponent implements AfterViewInit {
  @Input() tabs: string[] = [];
  @Input() activeIndex = 0;
  @Output() tabChanged = new EventEmitter<number>();

  tabBtns = viewChildren<ElementRef>('tabBtn');

  indicatorLeft = 0;
  indicatorWidth = 0;

  constructor() {
    effect(() => {
      this.tabBtns();
      this.updateIndicator();
    });
  }

  ngAfterViewInit(): void {
    this.updateIndicator();
  }

  onTabClick(index: number): void {
    this.tabChanged.emit(index);
    setTimeout(() => {
      this.updateIndicator();
      // Scroll active tab into view on mobile
      const btns = this.tabBtns();
      if (btns.length > index) {
        (btns[index].nativeElement as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 0);
  }

  private updateIndicator(): void {
    const btns = this.tabBtns();
    if (!btns.length || this.activeIndex >= btns.length) return;
    const el = btns[this.activeIndex].nativeElement as HTMLElement;
    this.indicatorLeft = el.offsetLeft;
    this.indicatorWidth = el.offsetWidth;
  }
}
