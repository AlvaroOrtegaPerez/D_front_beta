import { Component, Input } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  template: `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            @for (col of columns; track col.key) {
              <th [style.width]="col.width">{{ col.label }}</th>
            }
            @if (hasActions) { <th style="width: 100px">Acciones</th> }
          </tr>
        </thead>
        <tbody>
          @for (row of rows; track $index) {
            <tr>
              @for (col of columns; track col.key) {
                <td>{{ row[col.key] ?? '—' }}</td>
              }
              @if (hasActions) { <td><ng-content /></td> }
            </tr>
          } @empty {
            <tr><td [attr.colspan]="columns.length + (hasActions ? 1 : 0)" class="data-table__empty">Sin datos</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-wrap {
      overflow-x: auto; border-radius: 16px;
      background: rgba(255,255,255,0.85); backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.5);
      box-shadow: 0 4px 15px rgba(0,0,0,0.06);
    }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      text-align: left; padding: 14px 16px; font-size: 0.8rem;
      font-weight: 700; color: #64748b; text-transform: uppercase;
      letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0;
      background: rgba(241,245,249,0.5);
    }
    .data-table td {
      padding: 14px 16px; font-size: 0.9rem; color: #1e293b;
      border-bottom: 1px solid #f1f5f9;
    }
    .data-table tbody tr:hover { background: rgba(16,185,129,0.03); }
    .data-table__empty { text-align: center; color: #94a3b8; padding: 40px 16px; }
  `]
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() rows: Record<string, unknown>[] = [];
  @Input() hasActions = false;
}
