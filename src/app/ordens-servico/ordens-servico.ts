import { Component, OnInit, signal, ChangeDetectorRef, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdemServicoService, OrdemServico } from '../services/ordem-servico';

@Component({
  selector: 'app-ordens-servico',
  imports: [FormsModule, NgClass, RouterLink],
  templateUrl: './ordens-servico.html',
  styleUrl: './ordens-servico.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdensServico implements OnInit {
  private osService = inject(OrdemServicoService);
  private cdr = inject(ChangeDetectorRef);

  ordens = signal<OrdemServico[]>([]);
  
  novaOS = { cliente: '', clienteId: 0, equipamento: '', defeito: '', solucao: '', materiais: '', status: 'ABERTA' };

  idEmEdicao: number | null = null;
  processando: boolean = false;
  mensagemTerminal: string = '';

  mostrarConfirmacao: boolean = false;
  osParaDeletar: number | null = null;

  ngOnInit() {
    this.carregarDoBackend();
  }

  carregarDoBackend() {
    this.osService.listar().subscribe({
      next: (dados: OrdemServico[]) => {
        this.ordens.set(dados);
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Erro ao buscar OS:', err)
    });
  }

  editar(os: OrdemServico) {
    this.idEmEdicao = os.id;
    this.novaOS = { 
      cliente: os.cliente, 
      clienteId: os.clienteId || 0,
      equipamento: os.equipamento, 
      defeito: os.defeito, 
      solucao: os.solucao, 
      materiais: os.materiais,
      status: os.status
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicao() {
    this.idEmEdicao = null;
    this.novaOS = { cliente: '', clienteId: 0, equipamento: '', defeito: '', solucao: '', materiais: '', status: 'ABERTA' };
  }

  salvar() {
    if (!this.novaOS.cliente || !this.novaOS.equipamento || !this.novaOS.defeito) return;

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
          this.enviarParaBackend();
          this.processando = false;
          this.mensagemTerminal = '';
          this.cdr.detectChanges();
        }, 400);
      }
    }, 30);
  }

  private enviarParaBackend() {
    const agora = new Date();
    const dadosFormatados = {
      ...this.novaOS,
      data: agora.toLocaleDateString('pt-BR'),
      cliente: this.novaOS.cliente.toUpperCase(),
      equipamento: this.novaOS.equipamento.toUpperCase()
    };

    if (this.idEmEdicao) {
      this.osService.atualizar(this.idEmEdicao, dadosFormatados as OrdemServico).subscribe({
        next: () => {
          this.carregarDoBackend();
          this.cancelarEdicao();
          this.tocarBip();
        },
        error: (err: any) => console.error(err)
      });
    } else {
      this.osService.criar(dadosFormatados as OrdemServico).subscribe({
        next: () => {
          this.carregarDoBackend();
          this.cancelarEdicao();
          this.tocarBip();
        },
        error: (err: any) => console.error(err)
      });
    }
  }

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
      this.osService.excluir(this.osParaDeletar).subscribe({
        next: () => {
          this.carregarDoBackend();
          this.tocarBip();
          this.cancelarExclusao();
        },
        error: (err: any) => console.error(err)
      });
    }
  }

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
}