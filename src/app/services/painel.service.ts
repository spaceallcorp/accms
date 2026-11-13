import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, collectionData, deleteDoc, doc, docData } from '@angular/fire/firestore';
import { Painel } from '../models/painel.models';
import { PainelCollection } from '../models/cms-site.model';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PainelService {
  private firestore = inject(Firestore);

  paineis = signal<Painel[]>([]);

  constructor() {
    console.log('PaineisService initializado');
    this.getPaineis('paineis').subscribe(paineis => {
      console.log('Paineis carregados', paineis);
      this.paineis.set(paineis);
    });
  }

  getPaineis(collectionName: PainelCollection = 'paineis'): Observable<Painel[]> {
    console.log(`Fetching all paineis from ${collectionName}`);
    const targetCollection = collection(this.firestore, collectionName);
    return collectionData(targetCollection, { idField: 'id' }).pipe(
      map((paineis: any[]) => paineis.map(painel => painel as Painel)),
      tap(paineis => console.log(`Paineis from Firestore (${collectionName}):`, paineis))
    ) as Observable<Painel[]>;
  }

  getPainelById(id: string, collectionName: PainelCollection = 'paineis'): Observable<Painel | undefined> {
    console.log(`Fetching painel with ID: ${id} from ${collectionName}`);
    const postDoc = doc(this.firestore, `${collectionName}/${id}`);
    return docData(postDoc, { idField: 'id' }).pipe(
      map(painel => {
        if (!painel) {
          throw new Error('Painel não encontrado');
        }
        return painel as Painel;
      }),
      tap(painel => console.log('Retrieved painel:', painel))
    ) as Observable<Painel>;
  }

  async deletePainel(id: string, collectionName: PainelCollection = 'paineis'): Promise<void> {
    const painelDoc = doc(this.firestore, `${collectionName}/${id}`);
    return deleteDoc(painelDoc);
  }
}
