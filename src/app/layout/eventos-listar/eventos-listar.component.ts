import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { EventoService } from '../../services/evento.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BehaviorSubject, Observable, Subscription, switchMap } from 'rxjs';
import { EVENTO_COLLECTIONS, Evento, EventoCollection } from '../../models/evento.models';
import { CmsSiteService } from '../../services/cms-site.service';

@Component({
  selector: 'app-eventos-listar',
  imports: [AsyncPipe, CommonModule, FormsModule],
  templateUrl: './eventos-listar.component.html',
  styleUrl: './eventos-listar.component.css'
})
export class EventosListarComponent implements OnInit, OnDestroy {
  @Input() cmsMode = false;

  safeContent: SafeHtml = '';
  private eventoService = inject(EventoService);
  readonly cmsSiteService = inject(CmsSiteService);
  private siteSub?: Subscription;

  collections = EVENTO_COLLECTIONS;
  selectedCollection: EventoCollection = 'eventos';
  private collectionSubject = new BehaviorSubject<EventoCollection>('eventos');

  // Pesquisa & Paginação (modo CMS)
  searchQuery = '';
  currentPage = 1;
  pageSize = 5;
  pageSizeOptions = [5, 6, 10, 20];

  eventos$: Observable<Evento[]> = this.collectionSubject.pipe(
    switchMap(col => this.eventoService.getEventos(col))
  );

  constructor(
    private translate: TranslateService,
    private sanitizer: DomSanitizer
  ) {}

  useLanguage(language: string): void {
    this.translate.use(language);
  }

  ngOnInit() {
    if (this.cmsMode) {
      this.siteSub = this.cmsSiteService.activeSite$.subscribe(siteId => {
        const col = this.cmsSiteService.getSiteConfig(siteId).collections.eventos;
        this.selectedCollection = col;
        this.currentPage = 1;
        this.collectionSubject.next(col);
      });
    } else {
      this.collectionSubject.next('eventos');
    }

    this.eventos$.subscribe(eventos => {
      if (eventos.length > 0) {
        this.safeContent = this.sanitizer.bypassSecurityTrustHtml(eventos[0].content);
      }
    });
  }

  ngOnDestroy(): void {
    this.siteSub?.unsubscribe();
  }

  filterItems(items: Evento[]): Evento[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(item =>
      (item.title || '').toLowerCase().includes(q) ||
      (item.author || '').toLowerCase().includes(q)
    );
  }

  getTotalPages(totalItems: number): number {
    const total = Math.max(1, Math.ceil(totalItems / this.pageSize));
    if (this.currentPage > total) this.currentPage = total;
    return total;
  }

  getPaginatedItems(filtered: Evento[]): Evento[] {
    const total = this.getTotalPages(filtered.length);
    const safePage = Math.min(Math.max(1, this.currentPage), total);
    const start = (safePage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  getPages(totalPages: number): number[] {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  getRangeStart(totalItems: number): number {
    return totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  getRangeEnd(totalItems: number): number {
    return totalItems === 0 ? 0 : Math.min(this.currentPage * this.pageSize, totalItems);
  }

  goToPage(page: number, totalPages: number): void {
    if (page >= 1 && page <= totalPages) this.currentPage = page;
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.currentPage = 1;
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  async deleteEvento(evento: Evento): Promise<void> {
    if (!evento.id) return;
    const targetCol = evento.collection || this.selectedCollection;
    if (confirm(`Deseja realmente eliminar o evento "${evento.title}" de "${targetCol}"?`)) {
      await this.eventoService.deleteEvento(evento.id, targetCol);
    }
  }
}
