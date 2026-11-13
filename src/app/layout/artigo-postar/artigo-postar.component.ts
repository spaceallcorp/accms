import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Firestore, addDoc, collection, serverTimestamp } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EditorModule } from '@tinymce/tinymce-angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { POST_COLLECTIONS, PostCollection } from '../../models/cms-site.model';
import { CmsSiteService } from '../../services/cms-site.service';

@Component({
  selector: 'app-artigo-postar',
  standalone: true,
  imports: [FormsModule, CommonModule, EditorModule],
  templateUrl: './artigo-postar.component.html',
  styleUrls: ['./artigo-postar.component.css']
})
export class ArtigoPostarComponent implements OnInit, OnDestroy {
  private firestore = inject(Firestore);
  private router = inject(Router);
  private translate = inject(TranslateService);
  readonly cmsSiteService = inject(CmsSiteService);
  private siteSub?: Subscription;

  collections = POST_COLLECTIONS;
  selectedCollection: PostCollection = 'posts';

  // Data models
  editorContent: string = '';
  author: string = '';
  featuredImageUrl: string = '';
  newPost = {
    title: '',
    author: '',
  };

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // TinyMCE config
  editorConfig = {
    height: 260,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'anchor', 'pagebreak',
      'searchreplace', 'wordcount', 'visualblocks', 'visualchars', 'code', 'fullscreen', 'insertdatetime',
      'media', 'table', 'emoticons', 'help'
    ],
    toolbar:
      'undo redo | formatselect | bold italic backcolor | ' +
      'alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | removeformat | help'
  };

  constructor() {
    this.translate.setDefaultLang('pt');
    this.translate.use(this.translate.currentLang || 'pt');
  }

  ngOnInit(): void {
    this.siteSub = this.cmsSiteService.activeSite$.subscribe(siteId => {
      const siteConfig = this.cmsSiteService.getSiteConfig(siteId);
      this.selectedCollection = siteConfig.collections.posts;
    });
  }

  ngOnDestroy(): void {
    this.siteSub?.unsubscribe();
  }

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.newPost.title.trim()) {
      this.errorMessage = 'O título é obrigatório.';
      return;
    }

    if (!this.editorContent.trim()) {
      this.errorMessage = 'O conteúdo é obrigatório.';
      return;
    }

    this.isSubmitting = true;

    try {
      const targetCol = this.selectedCollection;
      const postsCollection = collection(this.firestore, targetCol);
      await addDoc(postsCollection, {
        title: this.newPost.title,
        content: this.editorContent,
        author: this.newPost.author,
        imageUrl: this.featuredImageUrl || null,
        collection: targetCol,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Reset form
      this.newPost.title = '';
      this.newPost.author = '';
      this.editorContent = '';
      this.featuredImageUrl = '';
      this.successMessage = `Artigo publicado com sucesso em "${targetCol}"!`;

      if (!this.router.url.includes('dashboard')) {
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Erro ao salvar o artigo:', error);
      this.errorMessage = this.getFirestoreError(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private getFirestoreError(error: any): string {
    if (error.code === 'permission-denied') {
      return 'Você não tem permissão para criar artigos.';
    }
    return 'Falha ao salvar. Tente novamente.';
  }

  useLanguage(language: string): void {
    this.translate.use(language);
  }
}
