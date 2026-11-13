import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Firestore, addDoc, collection, serverTimestamp } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EditorModule } from '@tinymce/tinymce-angular';
import { Subscription } from 'rxjs';
import { NOTICIA_COLLECTIONS, NoticiaCollection } from '../../models/cms-site.model';
import { CmsSiteService } from '../../services/cms-site.service';

@Component({
  selector: 'app-noticias-postar',
  imports: [FormsModule, CommonModule, EditorModule],
  templateUrl: './noticias-postar.component.html',
  styleUrl: './noticias-postar.component.css'
})
export class NoticiasPostarComponent implements OnInit, OnDestroy {
  private firestore = inject(Firestore);
  private router = inject(Router);
  readonly cmsSiteService = inject(CmsSiteService);
  private siteSub?: Subscription;

  collections = NOTICIA_COLLECTIONS;
  selectedCollection: NoticiaCollection = 'noticias';

  // Data models
  editorContent: string = '';
  author: string = '';
  featuredImageUrl: string = '';
  noticiaUrl: string = '';
  newNoticia = {
    title: '',
    author: '',
  };

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // TinyMCE config
  editorConfig = {
    height: 400,
    menubar: true,
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

  ngOnInit(): void {
    this.siteSub = this.cmsSiteService.activeSite$.subscribe(siteId => {
      const siteConfig = this.cmsSiteService.getSiteConfig(siteId);
      this.selectedCollection = siteConfig.collections.noticias;
    });
  }

  ngOnDestroy(): void {
    this.siteSub?.unsubscribe();
  }

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.newNoticia.title.trim()) {
      this.errorMessage = 'O título é obrigatório.';
      return;
    }

    this.isSubmitting = true;

    try {
      const targetCol = this.selectedCollection;
      const postsCollection = collection(this.firestore, targetCol);
      await addDoc(postsCollection, {
        title: this.newNoticia.title,
        content: this.editorContent,
        author: this.newNoticia.author,
        imageUrl: this.featuredImageUrl || null,
        noticiaUrl: this.noticiaUrl || null,
        collection: targetCol,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Reset form
      this.newNoticia.title = '';
      this.newNoticia.author = '';
      this.noticiaUrl = '';
      this.editorContent = '';
      this.featuredImageUrl = '';
      this.successMessage = `Notícia publicada com sucesso em "${targetCol}"!`;

      if (!this.router.url.includes('dashboard')) {
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Erro ao salvar a notícia:', error);
      this.errorMessage = this.getFirestoreError(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private getFirestoreError(error: any): string {
    if (error.code === 'permission-denied') {
      return 'Você não tem permissão para criar notícias.';
    }
    return 'Falha ao salvar. Tente novamente.';
  }
}
