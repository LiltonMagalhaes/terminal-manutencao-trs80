import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  private router = inject(Router);

  fazerLogin() {
    if (this.email === 'admin@prisma.com' && this.senha === '123456') {
      // Sucesso: vai para o Terminal
      this.router.navigate(['/terminal']);
    } else {
      this.mensagemErro = 'ACESSO NEGADO. VERIFIQUE AS CREDENCIAIS.';
    }
  }
}