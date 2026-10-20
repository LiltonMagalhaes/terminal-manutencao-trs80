import { Component, OnInit, signal, ChangeDetectorRef, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClienteService, Cliente } from '../services/cliente';

@Component({
  selector: 'app-clientes',
  imports: [FormsModule, NgClass, RouterLink],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Clientes implements OnInit {
  private clienteService = inject(ClienteService);
  private cdr = inject(ChangeDetectorRef);

  temaAtual: string = 'verde';
  modoTela: 'lista' | 'detalhes' = 'lista';
  termoBusca: string = '';

  clientes = signal<Cliente[]>([]);
  novoCliente: Cliente = this.limparFormulario();

  idEmEdicao: number | null = null;
  processando: boolean = false;
  mensagemTerminal: string = '';

  mostrarConfirmacao: boolean = false;
  clienteParaDeletar: number | null = null;

  ngOnInit() {
    this.carregarDoBackend(); 
  }

  private limparFormulario(): Cliente {
    return {
      id: 0, nome: '', cpfCnpj: '', telefone: '', email: '',
      cep: '', endereco: '', numero: '', bairro: '', cidade: '', estado: ''
    };
  }

  carregarDoBackend() {
    this.clienteService.listar().subscribe({
      next: (dados) => {
        this.clientes.set(dados);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao buscar clientes:', err)
    });
  }

  get clientesFiltrados() {
    if (!this.termoBusca) return this.clientes();
    const termo = this.termoBusca.toLowerCase();
    return this.clientes().filter(c => 
      c.nome.toLowerCase().includes(termo) || 
      c.cpfCnpj.includes(termo)
    );
  }

  novoCadastro() {
    this.limparFormulario();
    this.idEmEdicao = null;
    this.modoTela = 'detalhes';
  }

  selecionarCliente(cliente: Cliente) {
    this.novoCliente = { ...cliente };
    this.idEmEdicao = cliente.id;
    this.modoTela = 'detalhes';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  voltarParaLista() {
    this.limparFormulario();
    this.idEmEdicao = null;
    this.modoTela = 'lista';
  }

  salvar() {
    if (!this.novoCliente.nome || !this.novoCliente.telefone) return;

    this.processando = true;
    this.mensagemTerminal = '';
    const textoOriginal = this.idEmEdicao ? '> ATUALIZANDO... OK_' : '> CADASTRANDO... OK_';
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
    const dadosFormatados = {
      ...this.novoCliente,
      nome: this.novoCliente.nome.toUpperCase(),
      cidade: this.novoCliente.cidade.toUpperCase(),
      estado: this.novoCliente.estado.toUpperCase()
    };

    if (this.idEmEdicao) {
      this.clienteService.atualizar(this.idEmEdicao, dadosFormatados).subscribe({
        next: () => {
          this.carregarDoBackend();
          this.voltarParaLista();
          this.tocarBip();
        },
        error: (err) => console.error(err)
      });
    } else {
      this.clienteService.criar(dadosFormatados).subscribe({
        next: () => {
          this.carregarDoBackend();
          this.voltarParaLista();
          this.tocarBip();
        },
        error: (err) => console.error(err)
      });
    }
  }

  solicitarExclusao(id: number, event: Event) {
    event.stopPropagation();
    this.clienteParaDeletar = id;
    this.mostrarConfirmacao = true;
    this.tocarBipAlerta();
  }

  cancelarExclusao() {
    this.clienteParaDeletar = null;
    this.mostrarConfirmacao = false;
  }

  confirmarExclusao() {
    if (this.clienteParaDeletar !== null) {
      this.clienteService.excluir(this.clienteParaDeletar).subscribe({
        next: () => {
          this.carregarDoBackend();
          this.tocarBip();
          this.cancelarExclusao();
        },
        error: (err) => console.error(err)
      });
    }
  }

  formatarCpfCnpj(event: any) {
    let valor = event.target.value.replace(/\D/g, ''); 
    if (valor.length > 14) valor = valor.slice(0, 14); 
    if (valor.length <= 11) {
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
      valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
      valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
      valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
      valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    }
    this.novoCliente.cpfCnpj = valor;
  }

  formatarTelefone(event: any) {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.slice(0, 11); 
    if (valor.length > 10) {
      valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
      valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
    } else {
      valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
      valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    }
    this.novoCliente.telefone = valor;
  }

  formatarCep(event: any) {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor.length > 8) valor = valor.slice(0, 8);
    valor = valor.replace(/^(\d{5})(\d)/, '$1-$2');
    this.novoCliente.cep = valor;
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