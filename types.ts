
export enum Status {
  Aberto = 'Aberto',
  Pendente = 'Pendente',
  Fechado = 'Fechado',
}

export enum ConsentimentoStatus {
  Pendente = 'Pendente',
  Dado = 'Dado',
  Revogado = 'Revogado',
}

export enum EquipamentoStatus {
  Disponivel = 'Disponível',
  EmUso = 'Em uso',
  EmManutencao = 'Em manutenção',
}

export enum ViaturaStatus {
  Ativo = 'Ativo',
  EmManutencao = 'Em manutenção',
  Inativo = 'Inativo',
}


export interface Intervencao {
  id: number;
  titulo: string;
  descricao?: string;
  estado: Status;
  inicio: string; // ISO datetime string
  fim: string; // ISO datetime string
  viatura: string;
  responsavel: string;
  morada?: string;
  valorOrcamento?: number;
  viaturaId?: number;
  responsavelId?: number;
  ajudanteId?: number;
  clienteId?: number;
  equipamentos?: number[]; // Array of equipment IDs
}

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  nif: string;
  morada?: string;
  consentimento: ConsentimentoStatus;
  criadoEm: string; // ISO datetime string
}

export interface MembroEquipa {
  id: number;
  nome: string;
  funcao: string;
  email: string;
  telefone: string;
  ativo: boolean;
}

export interface Viatura {
  id: number;
  matricula: string;
  marca: string;
  modelo: string;
  ano: number;
  estado: ViaturaStatus;
  notas?: string;
  criadoEm: string; // ISO datetime string
}

export interface Equipamento {
  id: number;
  nome: string;
  tipo: string;
  numeroSerie: string;
  estado: EquipamentoStatus;
  criadoEm: string; // ISO datetime string
}

export interface User {
  id: number;
  email: string;
  name: string;
  initials: string;
}
