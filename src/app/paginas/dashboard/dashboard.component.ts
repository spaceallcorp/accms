import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArtigoPostarComponent } from '../../layout/artigo-postar/artigo-postar.component';
import { MenuComponent } from '../../layout/menu/menu.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ArtigoListaComponent } from '../../layout/artigo-lista/artigo-lista.component';
import { VagasCriarComponent } from '../../layout/vagas-criar/vagas-criar.component';
import { VagasListarComponent } from '../../layout/vagas-listar/vagas-listar.component';
import { NoticiasListarComponent } from '../../layout/noticias-listar/noticias-listar.component';
import { NoticiasPostarComponent } from '../../layout/noticias-postar/noticias-postar.component';
import { EventosListarComponent } from '../../layout/eventos-listar/eventos-listar.component';
import { EventosPostarComponent } from '../../layout/eventos-postar/eventos-postar.component';
import { PaineisPostarComponent } from '../../layout/paineis-postar/paineis-postar.component';
import { PaineisListarComponent } from '../../layout/paineis-listar/paineis-listar.component';
import { RodapeComponent } from '../../layout/rodape/rodape.component';
import { ProdutoCriarComponent } from '../../layout/produto-criar/produto-criar.component';
import { LayoutItemsComponent } from "../../layout/layout-items/layout-items.component";
import { ProductListComponent } from '../../layout/product-list/product-list.component';

import { AuthService } from '../../services/auth.service';
import { CmsSiteService } from '../../services/cms-site.service';
import { CmsSiteId } from '../../models/cms-site.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    ArtigoPostarComponent,
    MenuComponent,
    ArtigoListaComponent,
    VagasCriarComponent,
    VagasListarComponent,
    TranslatePipe,
    NoticiasListarComponent,
    NoticiasPostarComponent,
    EventosListarComponent,
    EventosPostarComponent,
    PaineisPostarComponent,
    PaineisListarComponent,
    RodapeComponent,
    ProdutoCriarComponent,
    LayoutItemsComponent,
    ProductListComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  public authService = inject(AuthService);
  public cmsSiteService = inject(CmsSiteService);

  async onLogout(): Promise<void> {
    await this.authService.logout();
  }

  useLanguage(language: string): void {
    this.translate.use(language);
  }

  constructor(private translate: TranslateService) {}

  activeTab: string = 'products'; // Set default active tab

  selectSite(siteId: CmsSiteId): void {
    this.cmsSiteService.setActiveSite(siteId);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  isTabActive(tab: string): boolean {
    return this.activeTab === tab;
  }
}
