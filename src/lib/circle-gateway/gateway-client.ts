import { GATEWAY_API_BASE_URL, CHAIN_NAMES } from './constants';

export interface BalanceResponse {
  token: string;
  balances: Array<{
    domain: number;
    depositor: string;
    balance: string;
  }>;
}

export interface TransferRequest {
  burnIntent?: {
    maxBlockHeight: string | bigint;
    maxFee: string | bigint;
    spec: TransferSpec;
  };
  signature: string;
}

export interface TransferSpec {
  version: number;
  sourceDomain: number;
  destinationDomain: number;
  sourceContract: string;
  destinationContract: string;
  sourceToken: string;
  destinationToken: string;
  sourceDepositor: string;
  destinationRecipient: string;
  sourceSigner: string;
  destinationCaller: string;
  value: string;
  salt: string;
  hookData: string;
}

export interface TransferResponse {
  transferId?: string;
  attestation: string;
  signature: string;
  fees?: {
    total: string;
    token: string;
    perIntent: Array<{
      transferSpecHash: string;
      domain: number;
      baseFee: string;
      transferFee?: string;
    }>;
  };
  success?: boolean;
  message?: string;
}

export class GatewayClient {
  // Get Gateway info
  async info() {
    const response = await fetch(`${GATEWAY_API_BASE_URL}/info`);
    return response.json();
  }

  // Check balances for a given depositor
  async balances(token: string, depositor: string, domains?: number[]): Promise<BalanceResponse> {
    if (!domains) {
      domains = Object.keys(CHAIN_NAMES).map((d) => parseInt(d));
    }
    
    const response = await fetch(`${GATEWAY_API_BASE_URL}/balances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        sources: domains.map((domain) => ({ depositor, domain })),
      }),
    });
    
    return response.json();
  }

  // Request transfer attestation
  async transfer(request: TransferRequest | TransferRequest[]): Promise<TransferResponse> {
    const response = await fetch(`${GATEWAY_API_BASE_URL}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ),
    });
    
    return response.json();
  }
}