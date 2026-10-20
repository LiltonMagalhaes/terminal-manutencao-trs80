import { Component, OnInit, signal, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // 👈 RouterLink adicionado aqui

interface OrdemServico {
  id: number;
  data: string;
  cliente: string;
  equipamento: string;
  defeito: string;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, NgClass, RouterLink], // 👈 RouterLink adicionado aqui
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard implements OnInit {
  dataAtual: string = '';
  horaAtual: string = '';
  temaAtual: string = 'verde';

  ordens = signal<OrdemServico[]>([]);
  novaOS = { cliente: '', equipamento: '', defeito: '' };

  idEmEdicao: number | null = null;
  processando: boolean = false;
  mensagemTerminal: string = '';

  mostrarConfirmacao: boolean = false;
  osParaDeletar: number | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit() {
    this.atualizarRelogio();
    this.carregarDoLocalStorage();
  }

  atualizarRelogio() {
    const agora = new Date();
    this.dataAtual = agora.toLocaleDateString('pt-BR');
    this.horaAtual = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    this.cdr.detectChanges();
  }

  mudarTema(tema: string) {
    this.temaAtual = tema;
  }

  // ==========================================
  // LOGOFF
  // ==========================================
  sair() {
    this.router.navigate(['/login']);
  }

  // ==========================================
  // PREPARAR PARA EDITAR
  // ==========================================
  editar(os: OrdemServico) {
    this.idEmEdicao = os.id;
    this.novaOS = { cliente: os.cliente, equipamento: os.equipamento, defeito: os.defeito };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicao() {
    this.idEmEdicao = null;
    this.novaOS = { cliente: '', equipamento: '', defeito: '' };
  }

  // ==========================================
  // SALVAR
  // ==========================================
  salvar() {
    if (!this.novaOS.cliente || !this.novaOS.equipamento || !this.novaOS.defeito) {
      return;
    }

    this.processando = true;
    this.mensagemTerminal = '';
    const textoOriginal = this.idEmEdicao ? '> ATUALIZANDO... OK_' : '> PROCESSANDO... OK_';
    let i = 0;

    const timer = setInterval(() => {
      this.mensagemTerminal += textoOriginal.charAt(i);
      i++;
      this.cdr.detectChanges();

      if (i >= textoOriginal.length) {
        clearInterval(timer);
        setTimeout(() => {
          if (this.idEmEdicao) {
            this.executarAtualizacao();
          } else {
            this.executarSalvamento();
          }
          this.processando = false;
          this.mensagemTerminal = '';
          this.cdr.detectChanges();
        }, 400);
      }
    }, 30);
  }

  private executarSalvamento() {
    const agora = new Date();
    const nova: OrdemServico = {
      id: Math.floor(Math.random() * 9000) + 1000,
      data: agora.toLocaleDateString('pt-BR'),
      cliente: this.novaOS.cliente.toUpperCase(),
      equipamento: this.novaOS.equipamento.toUpperCase(),
      defeito: this.novaOS.defeito,
      status: 'ABERTA'
    };

    this.ordens.update(listaAtual => [...listaAtual, nova]);
    this.cancelarEdicao();
    this.salvarNoLocalStorage();
    this.tocarBip();
  }

  private executarAtualizacao() {
    this.ordens.update(listaAtual =>
      listaAtual.map(os => {
        if (os.id === this.idEmEdicao) {
          return {
            ...os,
            cliente: this.novaOS.cliente.toUpperCase(),
            equipamento: this.novaOS.equipamento.toUpperCase(),
            defeito: this.novaOS.defeito
          };
        }
        return os;
      })
    );

    this.cancelarEdicao();
    this.salvarNoLocalStorage();
    this.tocarBip();
  }

  // ==========================================
  // DELEÇÃO COM CONFIRMAÇÃO
  // ==========================================
  solicitarExclusao(id: number) {
    this.osParaDeletar = id;
    this.mostrarConfirmacao = true;
    this.tocarBipAlerta();
  }

  cancelarExclusao() {
    this.osParaDeletar = null;
    this.mostrarConfirmacao = false;
  }

  confirmarExclusao() {
    if (this.osParaDeletar !== null) {
      this.ordens.update(listaAtual => listaAtual.filter(os => os.id !== this.osParaDeletar));
      this.salvarNoLocalStorage();
      this.tocarBip();
      this.cancelarExclusao();
    }
  }

  // ==========================================
  // ÁUDIO
  // ==========================================
  tocarBip() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) { }
  }

  tocarBipAlerta() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) { }
  }

  // ==========================================
  // LOCAL STORAGE
  // ==========================================
  salvarNoLocalStorage() {
    localStorage.setItem('ordens_servico', JSON.stringify(this.ordens()));
  }

  carregarDoLocalStorage() {
    const dados = localStorage.getItem('ordens_servico');
    if (dados) {
      this.ordens.set(JSON.parse(dados));
    }
  }
}