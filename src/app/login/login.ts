import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = '';
  senha: string = '';
  mensagemErro: string = '';
  carregando: boolean = false; // Para desabilitar o botão enquanto o C# responde

  private router = inject(Router);
  private authService = inject(AuthService);

  fazerLogin() {
    if (!this.email || !this.senha) return;

    this.carregando = true;
    this.mensagemErro = '';

    this.authService.login(this.email, this.senha).subscribe({
      next: (resposta) => {
        // Deu certo! O C# autorizou.
        this.router.navigate(['/menu']);
      },
      error: (erro) => {
        // Deu erro (401 - Não autorizado)
        this.mensagemErro = 'ACESSO NEGADO. VERIFIQUE AS CREDENCIAIS.';
        this.carregando = false;
      }
    });
  }
}