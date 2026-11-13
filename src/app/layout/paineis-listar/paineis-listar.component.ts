import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { PainelService } from '../../services/painel.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BehaviorSubject, Observable, Subscription, switchMap } from 'rxjs';
import { PAINEL_COLLECTIONS, PainelCollection } from '../../models/cms-site.model';
import { Painel } from '../../models/painel.models';
import { CmsSiteService } from '../../services/cms-site.service';

@Component({
  selector: 'app-paineis-listar',
  imports: [AsyncPipe, CommonModule, FormsModule],
  templateUrl: './paineis-listar.component.html',
  styleUrl: './paineis-listar.component.css'
})
export class PaineisListarComponent implements OnInit, OnDestroy {
  @Input() cmsMode = false;

  safeContent: SafeHtml = '';
  private painelService = inject(PainelService);
  readonly cmsSiteService = inject(CmsSiteService);
  private siteSub?: Subscription;

  collections = PAINEL_COLLECTIONS;
  selectedCollection: PainelCollection = 'paineis';
  private collectionSubject = new BehaviorSubject<PainelCollection>('paineis');

  // Pesquisa & Paginação (modo CMS)
  searchQuery = '';
  currentPage = 1;
  pageSize = 5;
  pageSizeOptions = [5, 6, 10, 20];

  paineis$: Observable<Painel[]> = this.collectionSubject.pipe(
    switchMap(col => this.painelService.getPaineis(col))
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
        const col = this.cmsSiteService.getSiteConfig(siteId).collections.paineis;
        this.selectedCollection = col;
        this.currentPage = 1;
        this.collectionSubject.next(col);
      });
    } else {
      this.collectionSubject.next('paineis');
    }

    this.paineis$.subscribe(paineis => {
      if (paineis.length > 0) {
        this.safeContent = this.sanitizer.bypassSecurityTrustHtml(paineis[0].content);
      }
    });
  }

  ngOnDestroy(): void {
    this.siteSub?.unsubscribe();
  }

  filterItems(items: Painel[]): Painel[] {
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

  getPaginatedItems(filtered: Painel[]): Painel[] {
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

  async deletePainel(painel: Painel): Promise<void> {
    if (!painel.id) return;
    if (confirm(`Deseja realmente eliminar o painel "${painel.title}" de "${this.selectedCollection}"?`)) {
      await this.painelService.deletePainel(painel.id, this.selectedCollection);
    }
  }
}
