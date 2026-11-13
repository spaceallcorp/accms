import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { VagaService } from '../../services/vaga.service';
import emailjs, { type EmailJSResponseStatus } from '@emailjs/browser';
import { AsyncPipe, CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Vaga } from '../../models/vagas.models';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subscription, switchMap } from 'rxjs';
import { VAGA_COLLECTIONS, VagaCollection } from '../../models/cms-site.model';
import { CmsSiteService } from '../../services/cms-site.service';

declare var UIkit: any;

@Component({
  selector: 'app-vagas-listar',
  standalone: true,
  imports: [AsyncPipe, CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './vagas-listar.component.html',
  styleUrls: ['./vagas-listar.component.css']
})
export class VagasListarComponent implements OnInit, OnDestroy {
  @Input() cmsMode = false;

  private vagaService = inject(VagaService);
  private sanitizer = inject(DomSanitizer);
  readonly cmsSiteService = inject(CmsSiteService);
  private siteSub?: Subscription;

  collections = VAGA_COLLECTIONS;
  selectedCollection: VagaCollection = 'vagas';
  private collectionSubject = new BehaviorSubject<VagaCollection>('vagas');

  // Pesquisa & Paginação (modo CMS)
  searchQuery = '';
  currentPage = 1;
  pageSize = 5;
  pageSizeOptions = [5, 6, 10, 20];

  vagas$: Observable<Vaga[]> = this.collectionSubject.pipe(
    switchMap(col => this.vagaService.getVagas(col))
  );

  selectedVaga: Vaga | null = null;
  contactForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    if (this.cmsMode) {
      this.siteSub = this.cmsSiteService.activeSite$.subscribe(siteId => {
        const col = this.cmsSiteService.getSiteConfig(siteId).collections.vagas;
        this.selectedCollection = col;
        this.currentPage = 1;
        this.collectionSubject.next(col);
      });
    } else {
      this.collectionSubject.next('vagas');
    }
  }

  ngOnDestroy(): void {
    this.siteSub?.unsubscribe();
  }

  filterItems(items: Vaga[]): Vaga[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(item =>
      (item.posicao || '').toLowerCase().includes(q) ||
      (item.departamento || '').toLowerCase().includes(q)
    );
  }

  getTotalPages(totalItems: number): number {
    const total = Math.max(1, Math.ceil(totalItems / this.pageSize));
    if (this.currentPage > total) this.currentPage = total;
    return total;
  }

  getPaginatedItems(filtered: Vaga[]): Vaga[] {
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

  async deleteVaga(vaga: Vaga, event: Event): Promise<void> {
    event.stopPropagation();
    if (!vaga.id) return;
    if (confirm(`Deseja realmente eliminar a vaga "${vaga.posicao}" de "${this.selectedCollection}"?`)) {
      await this.vagaService.deleteVaga(vaga.id, this.selectedCollection);
    }
  }

  isSending = false;

  submitForm(event: Event) {
    event.preventDefault();

    if (this.isSending) return;

    this.isSending = true;

    this.contactForm.markAllAsTouched();

    if (this.contactForm.invalid) {
      window.alert('Por favor, preencha todos os campos obrigatórios.');
      this.isSending = false;
      return;
    }

    const formData = {
      ...this.contactForm.value,
      position: this.selectedVaga?.posicao,
    };

    emailjs.send('service_yhmv9kn', 'template_5cejkm2', formData, {
      publicKey: 's3ApW9433DP5gZtVb'
    })
      .then(() => {
        console.log('SUCESSO');
        window.alert('Mensagem enviada com sucesso! 🎉');
        this.contactForm.reset();
      })
      .catch((error: EmailJSResponseStatus) => {
        console.error('Falhou...', error.text);
        window.alert('Não foi possível enviar sua candidatura.');
      })
      .finally(() => {
        this.isSending = false;
      });
  }

  openModal(vaga: Vaga): void {
    this.selectedVaga = vaga;
    setTimeout(() => UIkit.modal('#vaga-modal').show(), 0);
  }

  getResponsabilidades(): string {
    return this.selectedVaga?.content || '';
  }

  getSafeContent(): SafeHtml {
    if (!this.selectedVaga?.content) {
      return this.sanitizer.bypassSecurityTrustHtml('<p>No content available</p>');
    }
    return this.sanitizer.bypassSecurityTrustHtml(this.selectedVaga.content);
  }
}
