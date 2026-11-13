import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Firestore, addDoc, collection, serverTimestamp } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EditorModule } from '@tinymce/tinymce-angular';
import { Subscription } from 'rxjs';
import { EVENTO_COLLECTIONS, EventoCollection } from '../../models/evento.models';
import { CmsSiteService } from '../../services/cms-site.service';

@Component({
  selector: 'app-eventos-postar',
  imports: [FormsModule, CommonModule, EditorModule],
  templateUrl: './eventos-postar.component.html',
  styleUrl: './eventos-postar.component.css'
})
export class EventosPostarComponent implements OnInit, OnDestroy {
  private firestore = inject(Firestore);
  private router = inject(Router);
  readonly cmsSiteService = inject(CmsSiteService);
  private siteSub?: Subscription;

  // Available target collections
  collections = EVENTO_COLLECTIONS;
  selectedCollection: EventoCollection = 'eventos';

  // Data models
  editorContent: string = '';
  author: string = '';
  eventoUrl: string = '';
  featuredImageUrl: string = '';
  newEvento = {
    title: '',
    author: '',
    eventoUrl: '',
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
      this.selectedCollection = siteConfig.collections.eventos;
    });
  }

  ngOnDestroy(): void {
    this.siteSub?.unsubscribe();
  }

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.newEvento.title.trim()) {
      this.errorMessage = 'O título é obrigatório.';
      return;
    }

    if (!this.selectedCollection) {
      this.errorMessage = 'Seleccione o destino (colecção) do evento.';
      return;
    }

    this.isSubmitting = true;

    try {
      const targetCol = this.selectedCollection;
      const eventosCollection = collection(this.firestore, targetCol);
      await addDoc(eventosCollection, {
        title: this.newEvento.title,
        content: this.editorContent,
        author: this.newEvento.author,
        imageUrl: this.featuredImageUrl || null,
        eventoUrl: this.eventoUrl || null,
        collection: targetCol,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Reset form
      this.newEvento.title = '';
      this.newEvento.author = '';
      this.eventoUrl = '';
      this.editorContent = '';
      this.featuredImageUrl = '';
      this.successMessage = `Evento publicado com sucesso em "${targetCol}"!`;

      if (!this.router.url.includes('dashboard')) {
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Erro ao salvar o evento:', error);
      this.errorMessage = this.getFirestoreError(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private getFirestoreError(error: any): string {
    if (error.code === 'permission-denied') {
      return 'Você não tem permissão para criar eventos.';
    }
    return 'Falha ao salvar. Tente novamente.';
  }
}
