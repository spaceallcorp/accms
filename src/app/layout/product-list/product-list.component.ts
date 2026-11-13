import { Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Produto } from '../../models/products.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    AsyncPipe,
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent {
  private productService = inject(ProductService);
  private translate = inject(TranslateService);

  produtos$ = this.productService.getProducts();

  // Pesquisa e Paginação
  searchQuery = '';
  currentPage = 1;
  pageSize = 6;
  pageSizeOptions = [5, 6, 10, 20];

  // Controlos do fluxo de eliminação
  deletingId: string | number | null = null;
  selectedProductToDelete: Produto | null = null;

  constructor() {
    this.translate.setDefaultLang('pt');
    this.translate.use(this.translate.currentLang || 'pt');
  }

  /** Filtra os produtos pela pesquisa */
  filterProducts(produtos: Produto[]): Produto[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return produtos;
    return produtos.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const id = String(p.id || '').toLowerCase();
      const category = (p.productCategory || '').toLowerCase();
      const sector = (p.productSector || '').toLowerCase();
      return (
        name.includes(q) ||
        id.includes(q) ||
        category.includes(q) ||
        sector.includes(q)
      );
    });
  }

  /** Calcula total de páginas garantindo que currentPage fica dentro dos limites */
  getTotalPages(totalItems: number): number {
    const total = Math.max(1, Math.ceil(totalItems / this.pageSize));
    if (this.currentPage > total) {
      this.currentPage = total;
    }
    return total;
  }

  /** Devolve a fatia de produtos da página activa */
  getPaginatedProducts(filteredProducts: Produto[]): Produto[] {
    const totalPages = this.getTotalPages(filteredProducts.length);
    const safePage = Math.min(Math.max(1, this.currentPage), totalPages);
    const start = (safePage - 1) * this.pageSize;
    return filteredProducts.slice(start, start + this.pageSize);
  }

  /** Devolve lista de números de página para os botões de paginação */
  getPages(totalPages: number): number[] {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  getRangeStart(totalItems: number): number {
    if (totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getRangeEnd(totalItems: number): number {
    if (totalItems === 0) return 0;
    return Math.min(this.currentPage * this.pageSize, totalItems);
  }

  goToPage(page: number, totalPages: number): void {
    if (page < 1 || page > totalPages) return;
    this.currentPage = page;
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

  /** Abre o modal de confirmação */
  confirmarEliminacao(produto: Produto): void {
    this.selectedProductToDelete = produto;
  }

  /** Fecha o modal sem apagar */
  cancelarEliminacao(): void {
    this.selectedProductToDelete = null;
  }

  /** Executa a remoção no Firestore */
  async executarEliminacao(): Promise<void> {
    if (!this.selectedProductToDelete) return;

    const targetProduct = this.selectedProductToDelete;
    this.deletingId = targetProduct.id;
    this.selectedProductToDelete = null; // Fecha o modal

    try {
      await this.productService.deleteProduct(targetProduct.id.toString());
    } catch (error) {
      console.error('Erro ao apagar o produto:', error);
      alert('Ocorreu um erro ao tentar apagar o produto.');
    } finally {
      this.deletingId = null;
    }
  }

  useLanguage(language: string): void {
    this.translate.use(language);
  }
}
