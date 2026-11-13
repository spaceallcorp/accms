import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { CookieConsentService } from '../../services/cookie-consent.service';
import { LayoutItemsService } from '../../services/layout-items.service';
import { DEFAULT_FOOTER_ITEMS, footerItems } from '../../models/layout-items.model';

@Component({
  selector: 'app-rodape',
  imports: [TranslatePipe, CommonModule, RouterLink],
  templateUrl: './rodape.component.html',
  styleUrl: './rodape.component.css'
})
export class RodapeComponent implements OnInit {
  private cookieConsent = inject(CookieConsentService);
  private layoutService = inject(LayoutItemsService);

  footerItems$: Observable<footerItems[]> = new Observable<footerItems[]>();
  allFooterItems: footerItems[] = DEFAULT_FOOTER_ITEMS;

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.footerItems$ = this.layoutService.getFooterItems();
    this.footerItems$.subscribe({
      next: (items) => {
        if (items && items.length > 0) {
          this.allFooterItems = items;
        }
      },
      error: (err) => {
        console.warn('Error loading footer items from Firestore, using default items:', err);
      }
    });
  }

  get usefulLinksTop(): footerItems[] {
    return this.allFooterItems
      .filter(
        (item) =>
          (item.section || 'useful_links') === 'useful_links' &&
          item.translateKey !== 'canal.denuncias' &&
          !item.link?.includes('portaldenuncias') &&
          (item.order ?? 1) < 5
      )
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  }

  get usefulLinksBottom(): footerItems[] {
    return this.allFooterItems
      .filter(
        (item) =>
          (item.section || 'useful_links') === 'useful_links' &&
          (item.translateKey === 'canal.denuncias' ||
            item.link?.includes('portaldenuncias') ||
            (item.order ?? 1) >= 5)
      )
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  }

  get policyLinks(): footerItems[] {
    return this.allFooterItems
      .filter((item) => item.section === 'policies')
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  }

  get hasCookiesPolicyLink(): boolean {
    return this.policyLinks.some((item) => item.link === '/cookies-policies');
  }

  get aboutUsLinks(): footerItems[] {
    return this.allFooterItems
      .filter((item) => item.section === 'about_us')
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  }

  get officeLinks(): footerItems[] {
    return this.allFooterItems
      .filter((item) => item.section === 'offices')
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  }

  isExternalLink(link?: string): boolean {
    if (!link) {
      return false;
    }
    return /^https?:\/\//i.test(link);
  }

  useLanguage(language: string): void {
    this.translate.use(language);
  }

  openCookieSettings(): void {
    this.cookieConsent.openPreferences();
  }
}
