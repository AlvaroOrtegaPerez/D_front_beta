import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ComunidadService } from '../../core/services/comunidad.service';
import { ToastService } from '../../core/services/toast.service';
import { Comunidad, normalizeId } from '../../models/comunidad.model';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card';
import { EcoButtonComponent } from '../../shared/components/eco-button/eco-button';
import { BadgeComponent } from '../../shared/components/badge/badge';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-mis-comunidades',
  standalone: true,
  imports: [RouterLink, GlassCardComponent, EcoButtonComponent, BadgeComponent, LoadingSpinnerComponent, EmptyStateComponent, ConfirmDialogComponent],
  templateUrl: './mis-comunidades.html',
  styleUrl: './mis-comunidades.css'
})
export class MisComunidadesPage implements OnInit {
  private comunidadService = inject(ComunidadService);
  private toast = inject(ToastService);
  private router = inject(Router);

  comunidades = signal<Comunidad[]>([]);
  loading = signal(true);
  confirmOpen = signal(false);
  archivingId = signal<number | null>(null);

  ngOnInit(): void { this.loadComunidades(); }

  loadComunidades(): void {
    this.loading.set(true);
    this.comunidadService.getComunidades().subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : [];
        this.comunidades.set(list.filter(c => !c.archivada));
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Error al cargar comunidades'); }
    });
  }

  getId(c: Comunidad): number | null { return normalizeId(c); }

  editar(c: Comunidad): void {
    const id = this.getId(c);
    if (id) this.router.navigate(['/datos-comunidad'], { queryParams: { comunidades_id: id } });
  }

  confirmarArchivar(c: Comunidad): void {
    this.archivingId.set(this.getId(c));
    this.confirmOpen.set(true);
  }

  archivar(): void {
    const id = this.archivingId();
    if (!id) return;
    this.confirmOpen.set(false);
    this.comunidadService.archivarComunidad(id).subscribe({
      next: () => { this.toast.success('Comunidad archivada'); this.loadComunidades(); },
      error: () => this.toast.error('Error al archivar')
    });
  }

  irDashboard(): void { this.router.navigateByUrl('/dashboard-gestoria'); }
  nuevaComunidad(): void { this.router.navigateByUrl('/datos-comunidad'); }
}
