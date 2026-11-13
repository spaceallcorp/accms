import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Firestore, addDoc, collection, serverTimestamp } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EditorModule } from '@tinymce/tinymce-angular';
import { Subscription } from 'rxjs';
import { VAGA_COLLECTIONS, VagaCollection } from '../../models/cms-site.model';
import { CmsSiteService } from '../../services/cms-site.service';

@Component({
  selector: 'app-vagas-criar',
  imports: [FormsModule, CommonModule, EditorModule],
  templateUrl: './vagas-criar.component.html',
  styleUrl: './vagas-criar.component.css'
})
export class VagasCriarComponent implements OnInit, OnDestroy {
  private firestore = inject(Firestore);
  private router = inject(Router);
  readonly cmsSiteService = inject(CmsSiteService);
  private siteSub?: Subscription;

  collections = VAGA_COLLECTIONS;
  selectedCollection: VagaCollection = 'vagas';

  // Data models
  editorContent: string = '';
  author: string = '';
  featuredImageUrl: string = '';
  newVaga = {
    posicao: '',
    departamento: '',
  };

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // TinyMCE config
  editorConfig = {
    height: 240,
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

  ngOnInit(): void {
    this.siteSub = this.cmsSiteService.activeSite$.subscribe(siteId => {
      const siteConfig = this.cmsSiteService.getSiteConfig(siteId);
      this.selectedCollection = siteConfig.collections.vagas;
    });
  }

  ngOnDestroy(): void {
    this.siteSub?.unsubscribe();
  }

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.newVaga.posicao.trim()) {
      this.errorMessage = 'A posição é obrigatória.';
      return;
    }

    if (!this.editorContent.trim()) {
      this.errorMessage = 'As responsabilidades são obrigatórias.';
      return;
    }

    this.isSubmitting = true;

    try {
      const targetCol = this.selectedCollection;
      const vagasCollection = collection(this.firestore, targetCol);
      await addDoc(vagasCollection, {
        posicao: this.newVaga.posicao,
        content: this.editorContent,
        author: this.newVaga.departamento,
        departamento: this.newVaga.departamento,
        imageUrl: this.featuredImageUrl || null,
        collection: targetCol,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Reset form
      this.newVaga.posicao = '';
      this.newVaga.departamento = '';
      this.editorContent = '';
      this.featuredImageUrl = '';
      this.successMessage = `Vaga publicada com sucesso em "${targetCol}"!`;

      if (!this.router.url.includes('dashboard')) {
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Erro ao salvar a vaga:', error);
      this.errorMessage = this.getFirestoreError(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private getFirestoreError(error: any): string {
    if (error.code === 'permission-denied') {
      return 'Você não tem permissão para publicar Vagas.';
    }
    return 'Falha ao salvar. Tente novamente.';
  }
}
