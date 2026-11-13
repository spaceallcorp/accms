import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, collectionData, deleteDoc, doc, docData } from '@angular/fire/firestore';
import { Noticia } from '../models/noticias.models';
import { NoticiaCollection } from '../models/cms-site.model';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NoticiaService {
  private firestore = inject(Firestore);

  noticias = signal<Noticia[]>([]);

  constructor() {
    console.log('NoticiasService initializado');
    this.getNoticias('noticias').subscribe(noticias => {
      console.log('Noticias carregadas', noticias);
      this.noticias.set(noticias);
    });
  }

  getNoticias(collectionName: NoticiaCollection = 'noticias'): Observable<Noticia[]> {
    console.log(`Fetching all noticias from ${collectionName}`);
    const targetCollection = collection(this.firestore, collectionName);
    return collectionData(targetCollection, { idField: 'id' }).pipe(
      map((noticias: any[]) =>
        noticias
          .map(noticia => noticia as Noticia)
          .sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
            return dateB - dateA; // most recent first
          })
      ),
      tap(noticias => console.log(`Sorted noticias (${collectionName}):`, noticias))
    ) as Observable<Noticia[]>;
  }

  getPostById(id: string, collectionName: NoticiaCollection = 'noticias'): Observable<Noticia | undefined> {
    console.log(`Fetching noticia with ID: ${id} from ${collectionName}`);
    const postDoc = doc(this.firestore, `${collectionName}/${id}`);
    return docData(postDoc, { idField: 'id' }).pipe(
      map(noticia => {
        if (!noticia) {
          throw new Error('Noticia não encontrada');
        }
        return noticia as Noticia;
      }),
      tap(noticia => console.log('Retrieved noticia:', noticia))
    ) as Observable<Noticia>;
  }

  async deleteNoticia(id: string, collectionName: NoticiaCollection = 'noticias'): Promise<void> {
    const noticiaDoc = doc(this.firestore, `${collectionName}/${id}`);
    return deleteDoc(noticiaDoc);
  }
}
