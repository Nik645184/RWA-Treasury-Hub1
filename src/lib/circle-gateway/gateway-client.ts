import { 
  GATEWAY_API_BASE_URL_MAINNET, 
  GATEWAY_API_BASE_URL_TESTNET, 
  CHAIN_NAMES 
} from './constants';

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
  private apiUrl: string;
  
  constructor(isMainnet: boolean = false) {
    this.apiUrl = isMainnet ? GATEWAY_API_BASE_URL_MAINNET : GATEWAY_API_BASE_URL_TESTNET;
  }
  
  // Get Gateway info
  async info() {
    const response = await fetch(`${this.apiUrl}/info`);
    return response.json();
  }

  // Check balances for a given depositor
  async balances(token: string, depositor: string, domains?: number[]): Promise<BalanceResponse> {
    if (!domains) {
      // Include all supported domains based on environment
      if (this.apiUrl.includes('testnet')) {
        domains = [0, 1, 6]; // Ethereum Sepolia, Avalanche Fuji, Base Sepolia
      } else {
        domains = [0, 1, 2, 3, 6, 7, 10]; // All mainnet supported domains
      }
    }
    
    const response = await fetch(`${this.apiUrl}/balances`, {
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
    const response = await fetch(`${this.apiUrl}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request, (_key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ),
    });
    
    return response.json();
  }
}