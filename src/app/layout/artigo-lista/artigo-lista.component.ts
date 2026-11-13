import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { AsyncPipe, CommonModule, DatePipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, switchMap } from 'rxjs';
import { POST_COLLECTIONS, PostCollection } from '../../models/cms-site.model';
import { Post } from '../../models/posts.models';
import { CmsSiteService } from '../../services/cms-site.service';

@Component({
  selector: 'app-artigo-lista',
  standalone: true,
  imports: [
    AsyncPipe,
    CommonModule,
    DatePipe,
    NgIf,
    TranslatePipe,
    TruncatePipe,
    RouterLink,
    FormsModule
  ],
  templateUrl: './artigo-lista.component.html',
  styleUrl: './artigo-lista.component.css'
})
export class ArtigoListaComponent implements OnInit, OnDestroy {
  @Input() cmsMode = false;

  safeContent: SafeHtml = '';
  private blogService = inject(BlogService);
  readonly cmsSiteService = inject(CmsSiteService);
  private siteSub?: Subscription;

  collections = POST_COLLECTIONS;
  selectedCollection: PostCollection = 'posts';
  private collectionSubject = new BehaviorSubject<PostCollection>('posts');

  // Pesquisa & Paginação (modo CMS)
  searchQuery = '';
  currentPage = 1;
  pageSize = 6;
  pageSizeOptions = [5, 6, 10, 20];

  posts$: Observable<Post[]> = this.collectionSubject.pipe(
    switchMap(col => this.blogService.getPosts(col))
  );

  constructor(
    private translate: TranslateService,
    private sanitizer: DomSanitizer
  ) {
    this.translate.setDefaultLang('pt');
    this.translate.use(this.translate.currentLang || 'pt');
  }

  useLanguage(language: string): void {
    this.translate.use(language);
  }

  ngOnInit() {
    if (this.cmsMode) {
      this.siteSub = this.cmsSiteService.activeSite$.subscribe(siteId => {
        const col = this.cmsSiteService.getSiteConfig(siteId).collections.posts;
        this.selectedCollection = col;
        this.currentPage = 1;
        this.collectionSubject.next(col);
      });
    } else {
      this.collectionSubject.next('posts');
    }

    this.posts$.subscribe(posts => {
      if (posts.length > 0) {
        this.safeContent = this.sanitizer.bypassSecurityTrustHtml(posts[0].content);
      }
    });
  }

  ngOnDestroy(): void {
    this.siteSub?.unsubscribe();
  }

  filterItems(items: Post[]): Post[] {
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

  getPaginatedItems(filtered: Post[]): Post[] {
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

  async deletePost(post: Post): Promise<void> {
    if (!post.id) return;
    if (confirm(`Deseja realmente eliminar o artigo "${post.title}" de "${this.selectedCollection}"?`)) {
      await this.blogService.deletePost(post.id, this.selectedCollection);
    }
  }
}
