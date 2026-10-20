import { Routes } from '@angular/router';
import { Login } from './login/login';
import { MenuPrincipal } from './menu-principal/menu-principal';
import { OrdensServico } from './ordens-servico/ordens-servico';
import { Clientes } from './clientes/clientes';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'menu', component: MenuPrincipal }, // O novo hub principal
  { path: 'clientes', component: Clientes },
  { path: 'ordens-servico', component: OrdensServico }, // Rota renomeada
  { path: '**', redirectTo: 'login' }
];