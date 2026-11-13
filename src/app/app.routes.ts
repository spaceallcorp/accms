import { Routes } from '@angular/router';
import { LoginComponent } from './paginas/login/login.component';
import { DashboardComponent } from './paginas/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { ProductDetailComponent } from './layout/product-detail/product-detail.component';
import { ArtigoComponent } from './layout/artigo/artigo.component';

export const routes: Routes = [
  // Redireciona a raiz directamente para o Dashboard do CMS
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Autenticação
  { path: 'login', component: LoginComponent },

  // Painel de Controlo Central do CMS (Protegido)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'painel',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // Pré-visualização de conteúdos
  {
    path: 'product/:id',
    component: ProductDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'artigo/:id',
    component: ArtigoComponent,
    canActivate: [AuthGuard]
  },

  // Fallback seguro
  { path: '**', redirectTo: 'dashboard' }
];
