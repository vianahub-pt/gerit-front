
import { Status, Intervencao, Cliente, MembroEquipa, Viatura, Equipamento, ConsentimentoStatus, ViaturaStatus, EquipamentoStatus } from './types';

export const MOCK_INTERVENCOES: Intervencao[] = [
  { id: 1, titulo: "Reparação de Fuga de Água na Cozinha Principal", descricao: "Fuga identificada debaixo do lava-loiças. Necessário substituir o sifão.", estado: Status.Aberto, inicio: "2024-07-28T09:00", fim: "2024-07-28T11:00", viatura: "AB-12-CD", responsavel: "João Silva", viaturaId: 1, responsavelId: 1, clienteId: 3, equipamentos: [1, 3], morada: "Praça do Comércio 5, Lisboa", valorOrcamento: 85.50 },
  { id: 2, titulo: "Manutenção Preventiva Ar Condicionado", descricao: "Limpeza de filtros e verificação de gás no escritório do 2º andar.", estado: Status.Pendente, inicio: "2024-07-29T14:00", fim: "2024-07-29T16:00", viatura: "EF-34-GH", responsavel: "Maria Costa", viaturaId: 2, responsavelId: 2, clienteId: 1, morada: "Av. da Liberdade 110, Lisboa", valorOrcamento: 120.00 },
  { id: 3, titulo: "Instalação de Sistema de Videovigilância", descricao: "Instalação de 4 câmaras no exterior do condomínio.", estado: Status.Fechado, inicio: "2024-07-15T09:00", fim: "2024-07-16T17:00", viatura: "AB-12-CD", responsavel: "João Silva", viaturaId: 1, responsavelId: 1, clienteId: 2, ajudanteId: 3, equipamentos: [4], morada: "Rua do Sol 45, Faro", valorOrcamento: 850.00 },
  { id: 4, titulo: "Orçamento para Remodelação de Canalização", descricao: "Avaliação do estado da canalização da casa de banho social.", estado: Status.Aberto, inicio: "2024-08-01T10:00", fim: "2024-08-01T12:00", viatura: "IJ-56-KL", responsavel: "Carlos Santos", viaturaId: 3, responsavelId: 3, clienteId: 4, morada: "Rua das Flores 12, Porto", valorOrcamento: 45.00 },
  { id: 5, titulo: "Substituição de Caldeira Mural", descricao: "Remover caldeira antiga e instalar novo modelo XPTO.", estado: Status.Pendente, inicio: "2024-08-05T09:00", fim: "2024-08-05T15:00", viatura: "EF-34-GH", responsavel: "Maria Costa", viaturaId: 2, responsavelId: 2, ajudanteId: 3, equipamentos: [2, 3], morada: "Av. da República 20, Lisboa", valorOrcamento: 450.00 },
  { id: 6, titulo: "Inspeção Elétrica Periódica", descricao: "Verificação do quadro elétrico e tomadas.", estado: Status.Fechado, inicio: "2024-07-10T11:00", fim: "2024-07-10T13:00", viatura: "MN-78-OP", responsavel: "Ana Pereira", viaturaId: 4, responsavelId: 4, clienteId: 1, morada: "Av. da Liberdade 110, Lisboa", valorOrcamento: 90.00 },
  { id: 7, titulo: "Desentupimento Urgente de Esgoto", descricao: "Entupimento na caixa de saneamento principal do prédio.", estado: Status.Aberto, inicio: "2024-07-27T18:00", fim: "2024-07-27T20:00", viatura: "AB-12-CD", responsavel: "João Silva", viaturaId: 1, responsavelId: 1, clienteId: 2, morada: "Rua do Sol 45, Faro", valorOrcamento: 150.00 },
];

export const MOCK_CLIENTES: Cliente[] = [
  { id: 1, nome: "Empresa ABC, Lda", email: "geral@abc.pt", telefone: "210123456", nif: "500123456", morada: "Av. da Liberdade 110, Lisboa", consentimento: ConsentimentoStatus.Dado, criadoEm: "2023-01-15T10:30:00Z" },
  { id: 2, nome: "Condomínio Sol", email: "condominio.sol@mail.com", telefone: "912345678", nif: "999876543", morada: "Rua do Sol 45, Faro", consentimento: ConsentimentoStatus.Pendente, criadoEm: "2023-03-22T14:00:00Z" },
  { id: 3, nome: "Restaurante Sabor", email: "restaurante.sabor@email.com", telefone: "223456789", nif: "501987654", morada: "Praça do Comércio 5, Lisboa", consentimento: ConsentimentoStatus.Revogado, criadoEm: "2023-05-10T09:15:00Z" },
  { id: 4, nome: "Particular - Ana Santos", email: "ana.santos@email.com", telefone: "961234567", nif: "234567890", morada: "Rua das Flores 12, Porto", consentimento: ConsentimentoStatus.Dado, criadoEm: "2023-06-01T11:20:00Z" }
];

export const MOCK_EQUIPA: MembroEquipa[] = [
  { id: 1, nome: "João Silva", funcao: "Técnico Sénior", email: "joao.silva@geritapp.com", telefone: "910000001", ativo: true },
  { id: 2, nome: "Maria Costa", funcao: "Técnica Especialista", email: "maria.costa@geritapp.com", telefone: "910000002", ativo: true },
  { id: 3, nome: "Carlos Santos", funcao: "Ajudante", email: "carlos.santos@geritapp.com", telefone: "910000003", ativo: true },
  { id: 4, nome: "Ana Pereira", funcao: "Gestora Operacional", email: "ana.pereira@geritapp.com", telefone: "910000004", ativo: true },
];

export const MOCK_VIATURAS: Viatura[] = [
  { id: 1, matricula: "AB-12-CD", marca: "Renault", modelo: "Kangoo", ano: 2019, estado: ViaturaStatus.Ativo, criadoEm: "2023-01-10T10:00:00Z" },
  { id: 2, matricula: "EF-34-GH", marca: "Peugeot", modelo: "Partner", ano: 2021, estado: ViaturaStatus.Ativo, criadoEm: "2023-02-15T10:00:00Z" },
  { id: 3, matricula: "IJ-56-KL", marca: "Ford", modelo: "Transit", ano: 2018, estado: ViaturaStatus.EmManutencao, notas: "Revisão agendada", criadoEm: "2023-01-10T10:00:00Z" },
  { id: 4, matricula: "MN-78-OP", marca: "Citroën", modelo: "Berlingo", ano: 2020, estado: ViaturaStatus.Ativo, criadoEm: "2023-05-20T10:00:00Z" },
];

export const MOCK_EQUIPAMENTO: Equipamento[] = [
  { id: 1, nome: "Berbequim Percutor", tipo: "Ferramenta Elétrica", numeroSerie: "BP-12345", estado: EquipamentoStatus.Disponivel, criadoEm: "2023-01-05T09:00:00Z" },
  { id: 2, nome: "Rebarbadora", tipo: "Ferramenta Elétrica", numeroSerie: "RB-67890", estado: EquipamentoStatus.EmUso, criadoEm: "2023-01-05T09:00:00Z" },
  { id: 3, nome: "Jogo de Chaves Inglesas", tipo: "Ferramenta Manual", numeroSerie: "JCI-001", estado: EquipamentoStatus.Disponivel, criadoEm: "2023-01-05T09:00:00Z" },
  { id: 4, nome: "Multímetro Digital", tipo: "Medição", numeroSerie: "MD-555", estado: EquipamentoStatus.EmManutencao, criadoEm: "2023-03-12T09:00:00Z" },
];
