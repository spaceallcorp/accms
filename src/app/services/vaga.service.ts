import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, collectionData, deleteDoc, doc, docData } from '@angular/fire/firestore';
import { Vaga } from '../models/vagas.models';
import { VagaCollection } from '../models/cms-site.model';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VagaService {
  private firestore = inject(Firestore);

  vagas = signal<Vaga[]>([]);

  constructor() {
    console.log('VagaService initializado');
    this.getVagas('vagas').subscribe(vagas => {
      console.log('Vagas carregadas', vagas);
      this.vagas.set(vagas);
    });
  }

  getVagas(collectionName: VagaCollection = 'vagas'): Observable<Vaga[]> {
    console.log(`Fetching all vagas from ${collectionName}`);
    const targetCollection = collection(this.firestore, collectionName);
    return collectionData(targetCollection, { idField: 'id' }).pipe(
      map((posts: any[]) => posts.map(vaga => vaga as Vaga)),
      tap(posts => console.log(`Vagas from Firestore (${collectionName}):`, posts))
    ) as Observable<Vaga[]>;
  }

  getPostById(id: string, collectionName: VagaCollection = 'vagas'): Observable<Vaga | undefined> {
    console.log(`Fetching vaga with ID: ${id} from ${collectionName}`);
    const postDoc = doc(this.firestore, `${collectionName}/${id}`);
    return docData(postDoc, { idField: 'id' }).pipe(
      map(vaga => {
        if (!vaga) {
          throw new Error('Vaga not found');
        }
        return vaga as Vaga;
      }),
      tap(vaga => console.log('Retrieved vaga:', vaga))
    ) as Observable<Vaga>;
  }

  async deleteVaga(id: string, collectionName: VagaCollection = 'vagas'): Promise<void> {
    const vagaDoc = doc(this.firestore, `${collectionName}/${id}`);
    return deleteDoc(vagaDoc);
  }
}
