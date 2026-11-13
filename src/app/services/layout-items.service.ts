// layout-items.service.ts
import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  navBarItems,
  footerItems,
  DEFAULT_FOOTER_ITEMS,
  siteLogos,
  socialMedia,
  addresses,
  heroSlider,
  partners,
  SUBSIDIARY_DEFAULT_ADDRESSES,
  SUBSIDIARY_DEFAULT_LOGOS,
  SUBSIDIARY_DEFAULT_SOCIAL,
} from '../models/layout-items.model';
import { CmsSiteService } from './cms-site.service';
import { CmsSiteId } from '../models/cms-site.model';

type BaseLayoutCollection =
  | 'navBarItems'
  | 'footerItems'
  | 'siteLogos'
  | 'socialMedia'
  | 'addresses'
  | 'partners'
  | 'heroSlider';

@Injectable({
  providedIn: 'root',
})
export class LayoutItemsService {
  private seedingFooter = new Set<string>();

  constructor(
    private firestore: Firestore,
    private cmsSiteService: CmsSiteService
  ) {}

  /** Resolve o nome da colecção Firestore com base no sufixo da subsidiária (ex: footerItems, footerItemsPt, footerItemsNg, footerItemsZa) */
  private resolveCollectionName(base: BaseLayoutCollection, siteId?: CmsSiteId): string {
    const targetSite = siteId ?? this.cmsSiteService.activeSiteId();
    return this.cmsSiteService.getLayoutCollectionName(base, targetSite);
  }

  // ==================== NAVIGATION BAR ====================

  getNavBarItems(siteId?: CmsSiteId): Observable<navBarItems[]> {
    const colName = this.resolveCollectionName('navBarItems', siteId);
    const navBarCollection = collection(this.firestore, colName);
    return (collectionData(navBarCollection, { idField: 'id' }) as Observable<navBarItems[]>).pipe(
      map((items) => [...items].sort((a, b) => (a.order ?? 99) - (b.order ?? 99)))
    );
  }

  addNavBarItem(item: navBarItems, siteId?: CmsSiteId) {
    const colName = this.resolveCollectionName('navBarItems', siteId);
    const navBarCollection = collection(this.firestore, colName);
    return addDoc(navBarCollection, item);
  }

  updateNavBarItem(id: string, item: Partial<navBarItems>, siteId?: CmsSiteId) {
    const colName = this.resolveCollectionName('navBarItems', siteId);
    const navBarDocRef = doc(this.firestore, `${colName}/${id}`);
    return updateDoc(navBarDocRef, item);
  }

  deleteNavBarItem(id: string, siteId?: CmsSiteId) {
    const colName = this.resolveCollectionName('navBarItems', siteId);
    const navBarDocRef = doc(this.firestore, `${colName}/${id}`);
    return deleteDoc(navBarDocRef);
  }

  // ==================== FOOTER ====================

  getFooterItems(siteId?: CmsSiteId): Observable<footerItems[]> {
    const targetSite = siteId ?? this.cmsSiteService.activeSiteId();
    const colName = this.resolveCollectionName('footerItems', targetSite);
    const footerCollection = collection(this.firestore, colName);

    return (collectionData(footerCollection, { idField: 'id' }) as Observable<footerItems[]>).pipe(
      tap((items) => {
        // Auto-seed apenas se a colecção principal ou subsidiária estiver completamente vazia e não estiver a semear
        if (items.length === 0 && !this.seedingFooter.has(colName)) {
          this.seedDefaultFooterItems(targetSite).catch((err) =>
            console.warn(`Could not auto-seed footer items for ${colName}:`, err)
          );
        }
      }),
      map((items) => {
        const list = items.length > 0 ? items : DEFAULT_FOOTER_ITEMS;
        return [...list].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
      })
    );
  }

  async seedDefaultFooterItems(siteId?: CmsSiteId): Promise<void> {
    const targetSite = siteId ?? this.cmsSiteService.activeSiteId();
    const colName = this.resolveCollectionName('footerItems', targetSite);

    if (this.seedingFooter.has(colName)) return;
    this.seedingFooter.add(colName);

    try {
      for (const item of DEFAULT_FOOTER_ITEMS) {
        const { id, ...data } = item;
        const docRef = doc(this.firestore, `${colName}/${id}`);
        await setDoc(docRef, data, { merge: true });
      }
    } finally {
      this.seedingFooter.delete(colName);
    }
  }

  addFooterItem(item: Partial<footerItems>, siteId?: CmsSiteId) {
    const colName = this.resolveCollectionName('footerItems', siteId);
    const footerCollection = collection(this.firestore, colName);
    return addDoc(footerCollection, item);
  }

  updateFooterItem(id: string, item: Partial<footerItems>, siteId?: CmsSiteId) {
    const colName = this.resolveCollectionName('footerItems', siteId);
    const footerDocRef = doc(this.firestore, `${colName}/${id}`);
    return updateDoc(footerDocRef, item);
  }

  deleteFooterItem(id: string, siteId?: CmsSiteId) {
    const colName = this.resolveCollectionName('footerItems', siteId);
    const footerDocRef = doc(this.firestore, `${colName}/${id}`);
    return deleteDoc(footerDocRef);
  }

  // ==================== SITE LOGOS ====================

  getSiteLogos(siteId?: CmsSiteId): Observable<siteLogos[]> {
    const colName = this.resolveCollectionName('siteLogos', siteId);
    const logosCollection = collection(this.firestore, colName);
    return collectionData(logosCollection, { idField: 'id' }) as Observable<siteLogos[]>;
  }

  addSiteLogos(item: siteLogos, siteId?: CmsSiteId) {
    const colName = this.resolveCollectionName('siteLogos', siteId);
    const logosCollection = collection(this.firestore, colName);
    return addDoc(logosCollection, item);
  }

  updateSiteLogos(id: string, item: Partial<siteLogos>, siteId?: CmsSiteId) {
    const colName = this.resolveCollectionName('siteLogos', siteId);
    const logosDocRef = doc(this.firestore, `${colName}/${id}`);
    return updateDoc(logosDocRef, item);
  }

  deleteSiteLogos(id: string, siteId?: CmsSiteId) {
    const colName = this.resolveCollectionName('siteLogos', siteId);
    const logosDocRef = doc(this.firestore, `${colName}/${id}`);
    return deleteDoc(logosDocRef);
  }

  // ==================== SOCIAL MEDIA ====================

  getSocialMedia(siteId?: CmsSiteId): Observable<socialMedia[]> {
    const colName = this.resolveCollectionName('socialMedia', siteId);
    const socialCollection = collection(this.firestore, colName);
    return collectionData(socialCollection, { idField: 'id' }) as Observable<socialMedia[]>;
  }

  addSocialMedia(item: socialMedia, siteId?: CmsSiteId) {
    const colName = this.resolveCollectionName('socialMedia', siteId);
    const socialCollection = collection(this.firestore, colName);
    return addDoc(socialCollection, item);
  }

  updateSocialMedia(id: string, item: Partial<socialMedia>, siteId?: CmsSiteId) {
    const colName = this.resolveCollectionName('socialMedia', siteId);
    const socialDocRef = doc(this.firestore, `${colName}/${id}`);
    return updateDoc(socialDocRef, item);
  }

  deleteSocialMedia(id: string, siteId?: CmsSiteId) {
    const colName = this.resolveCollectionName('socialMedia', siteId);
    const socialDocRef = doc(this.firestore, `${colName}/${id}`);
    return deleteDoc(socialDocRef);
  }

  // ==================== ADDRESSES ====================

  getAddresses(siteId?: CmsSiteId): Observable<addresses[]> {
    const colName = this.resolveCollectionName('addresses', siteId);
    const addressesCollection = collection(this.firestore, colName);
    return collectionData(addressesCollection, { idField: 'id' }) as Observable<addresses[]>;
  }

  addAddress(item: addresses, siteId?: CmsSiteId) {
    const colName = this.resolveCollectionName('addresses', siteId);
    const addressesCollection = collection(this.firestore, colName);
    return addDoc(addressesCollection, item);
  }

  updateAddress(id: string, item: Partial<addresses>, siteId?: CmsSiteId) {
    const colName = this.resolveCollectionName('addresses', siteId);
    const addressDocRef = doc(this.firestore, `${colName}/${id}`);
    return updateDoc(addressDocRef, item);
  }

  deleteAddress(id: string, siteId?: CmsSiteId) {
    const colName = this.resolveCollectionName('addresses', siteId);
    const addressDocRef = doc(this.firestore, `${colName}/${id}`);
    return deleteDoc(addressDocRef);
  }

  // ==================== PARTNERS ====================

  getPartners(siteId?: CmsSiteId): Observable<partners[]> {
    const colName = this.resolveCollectionName('partners', siteId);
    const partnersCollection = collection(this.firestore, colName);
    return collectionData(partnersCollection, { idField: 'id' }) as Observable<partners[]>;
  }

  addPartner(item: partners, siteId?: CmsSiteId) {
    const colName = this.resolveCollectionName('partners', siteId);
    const partnersCollection = collection(this.firestore, colName);
    return addDoc(partnersCollection, item);
  }

  updatePartner(id: string, item: Partial<partners>, siteId?: CmsSiteId) {
    const colName = this.resolveCollectionName('partners', siteId);
    const partnerDocRef = doc(this.firestore, `${colName}/${id}`);
    return updateDoc(partnerDocRef, item);
  }

  deletePartner(id: string, siteId?: CmsSiteId) {
    const colName = this.resolveCollectionName('partners', siteId);
    const partnerDocRef = doc(this.firestore, `${colName}/${id}`);
    return deleteDoc(partnerDocRef);
  }

  // ==================== HERO SLIDER ====================

  getHeroSlides(siteId?: CmsSiteId): Observable<heroSlider[]> {
    const colName = this.resolveCollectionName('heroSlider', siteId);
    const heroCollection = collection(this.firestore, colName);
    return collectionData(heroCollection, { idField: 'id' }) as Observable<heroSlider[]>;
  }

  addHeroSlide(item: heroSlider, siteId?: CmsSiteId) {
    const colName = this.resolveCollectionName('heroSlider', siteId);
    const heroCollection = collection(this.firestore, colName);
    return addDoc(heroCollection, item);
  }

  updateHeroSlide(id: string, item: Partial<heroSlider>, siteId?: CmsSiteId) {
    const colName = this.resolveCollectionName('heroSlider', siteId);
    const heroDocRef = doc(this.firestore, `${colName}/${id}`);
    return updateDoc(heroDocRef, item);
  }

  deleteHeroSlide(id: string, siteId?: CmsSiteId) {
    const colName = this.resolveCollectionName('heroSlider', siteId);
    const heroDocRef = doc(this.firestore, `${colName}/${id}`);
    return deleteDoc(heroDocRef);
  }

  // ==================== SEED SUBSIDIARY DEFAULTS ====================

  /**
   * Preenche dados padrão (Endereços, Logos oficiais, Redes Sociais e Footer)
   * para uma subsidiária específica caso as colecções estejam vazias.
   */
  async seedSubsidiaryDefaults(siteId?: CmsSiteId): Promise<{ seeded: string[] }> {
    const targetSite = siteId ?? this.cmsSiteService.activeSiteId();
    const seeded: string[] = [];

    // 1. Seed Addresses se vazio
    const addrColName = this.resolveCollectionName('addresses', targetSite);
    const addrSnapshot = await getDocs(collection(this.firestore, addrColName));
    if (addrSnapshot.empty && SUBSIDIARY_DEFAULT_ADDRESSES[targetSite]) {
      for (const addr of SUBSIDIARY_DEFAULT_ADDRESSES[targetSite]) {
        const { id, ...data } = addr;
        await setDoc(doc(this.firestore, `${addrColName}/${id}`), data, { merge: true });
      }
      seeded.push(`Endereços (${addrColName})`);
    }

    // 2. Seed Logos se vazio
    const logosColName = this.resolveCollectionName('siteLogos', targetSite);
    const logosSnapshot = await getDocs(collection(this.firestore, logosColName));
    if (logosSnapshot.empty && SUBSIDIARY_DEFAULT_LOGOS[targetSite]) {
      const logoData = SUBSIDIARY_DEFAULT_LOGOS[targetSite];
      const { id, ...data } = logoData;
      await setDoc(doc(this.firestore, `${logosColName}/${id}`), data, { merge: true });
      seeded.push(`Logotipos Oficiais (${logosColName})`);
    }

    // 3. Seed Social Media se vazio
    const socialColName = this.resolveCollectionName('socialMedia', targetSite);
    const socialSnapshot = await getDocs(collection(this.firestore, socialColName));
    if (socialSnapshot.empty && SUBSIDIARY_DEFAULT_SOCIAL[targetSite]) {
      for (const soc of SUBSIDIARY_DEFAULT_SOCIAL[targetSite]) {
        const { id, ...data } = soc;
        await setDoc(doc(this.firestore, `${socialColName}/${id}`), data, { merge: true });
      }
      seeded.push(`Redes Sociais (${socialColName})`);
    }

    // 4. Seed Footer se vazio
    await this.seedDefaultFooterItems(targetSite);
    seeded.push(`Links de Rodapé (${this.resolveCollectionName('footerItems', targetSite)})`);

    return { seeded };
  }
}
