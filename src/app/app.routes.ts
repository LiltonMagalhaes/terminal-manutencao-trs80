import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
    // A raiz do sistema agora é o Login
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'terminal', component: Dashboard },

    // Rota de segurança (se digitar qualquer coisa errada, volta pro login)
    { path: '**', redirectTo: 'login' }
];