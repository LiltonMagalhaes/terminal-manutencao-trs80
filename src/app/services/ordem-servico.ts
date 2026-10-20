import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrdemServico {
  id: number;
  cliente: string;
  clienteId: number;
  data: string;
  equipamento: string;
  defeito: string;
  solucao: string;
  materiais: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrdemServicoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5125/api/ordensservico'; 

  listar(): Observable<OrdemServico[]> {
    return this.http.get<OrdemServico[]>(this.apiUrl);
  }

  criar(os: OrdemServico): Observable<OrdemServico> {
    return this.http.post<OrdemServico>(this.apiUrl, os);
  }

  atualizar(id: number, os: OrdemServico): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, os);
  }

  excluir(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}