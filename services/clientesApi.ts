import { Cliente } from '../types';

const API_URL = 'http://localhost:3001/api';

export async function getClientes(): Promise<Cliente[]> {
  const response = await fetch(`${API_URL}/clientes`);
  if (!response.ok) {
    throw new Error('Erro ao buscar clientes');
  }
  return response.json();
}

export async function createCliente(cliente: {
  nome: string;
  morada?: string | null;
  nif?: string | null;
  telefone?: string | null;
  email?: string | null;
  consentimento: string;
}) {
  const response = await fetch(`${API_URL}/clientes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cliente),
  });

  if (!response.ok) {
    throw new Error('Erro ao criar cliente');
  }

  return response.json();
}
