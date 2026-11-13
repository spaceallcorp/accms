import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Firestore, addDoc, collection, serverTimestamp } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EditorModule } from '@tinymce/tinymce-angular';
import { Subscription } from 'rxjs';
import { PAINEL_COLLECTIONS, PainelCollection } from '../../models/cms-site.model';
import { CmsSiteService } from '../../services/cms-site.service';

@Component({
  selector: 'app-paineis-postar',
  imports: [FormsModule, CommonModule, EditorModule],
  templateUrl: './paineis-postar.component.html',
  styleUrl: './paineis-postar.component.css'
})
export class PaineisPostarComponent implements OnInit, OnDestroy {
  private firestore = inject(Firestore);
  private router = inject(Router);
  readonly cmsSiteService = inject(CmsSiteService);
  private siteSub?: Subscription;

  collections = PAINEL_COLLECTIONS;
  selectedCollection: PainelCollection = 'paineis';

  // Data models
  editorContent: string = '';
  author: string = '';
  featuredImageUrl: string = '';
  painelUrl: string = '';
  newPainel = {
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
      this.selectedCollection = siteConfig.collections.paineis;
    });
  }

  ngOnDestroy(): void {
    this.siteSub?.unsubscribe();
  }

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.newPainel.title.trim()) {
      this.errorMessage = 'O título é obrigatório.';
      return;
    }

    this.isSubmitting = true;

    try {
      const targetCol = this.selectedCollection;
      const paineisCollection = collection(this.firestore, targetCol);
      await addDoc(paineisCollection, {
        title: this.newPainel.title,
        content: this.editorContent,
        author: this.newPainel.author,
        imageUrl: this.featuredImageUrl || null,
        painelUrl: this.painelUrl,
        collection: targetCol,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Reset form
      this.newPainel.title = '';
      this.newPainel.author = '';
      this.painelUrl = '';
      this.editorContent = '';
      this.featuredImageUrl = '';
      this.successMessage = `Painel publicado com sucesso em "${targetCol}"!`;

      if (!this.router.url.includes('dashboard')) {
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Erro ao salvar o painel:', error);
      this.errorMessage = this.getFirestoreError(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private getFirestoreError(error: any): string {
    if (error.code === 'permission-denied') {
      return 'Você não tem permissão para criar painéis.';
    }
    return 'Falha ao salvar. Tente novamente.';
  }
}
