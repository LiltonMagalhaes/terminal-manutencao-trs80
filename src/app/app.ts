import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  
  dataAtual: string = '';
  horaAtual: string = '';

  // 👇 MÁGICA: Um "getter" que sempre verifica a URL atual em tempo real
  get isLogado(): boolean {
    const url = this.router.url;
    // Se a URL for a raiz (vazia) ou /login, NÃO está logado.
    return url !== '/' && url !== '/login';
  }

  ngOnInit() {
    this.atualizarRelogio();
  }

  atualizarRelogio() {
    const agora = new Date();
    this.dataAtual = agora.toLocaleDateString('pt-BR');
    this.horaAtual = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    this.cdr.detectChanges();
  }

  sair() {
    this.router.navigate(['/login']);
  }
}