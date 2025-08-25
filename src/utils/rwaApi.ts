// RWA (Real World Assets) API utilities for tokenized assets

export interface TokenizedAsset {
  id: string;
  symbol: string;
  name: string;
  category: 'treasury' | 'private-credit' | 'real-estate' | 'commodity';
  issuer: string;
  blockchain: string[];
  aum: number; // Assets Under Management in USD
  yield: number; // Annual percentage yield
  maturity?: string; // For bonds/credit
  liquidityScore: number; // 0-100
  riskScore: number; // 0-100
  holders: number;
  dailyVolume: number;
  price: number;
  changePercent: number;
  change24h: number;
  marketCap: number;
  tvl: number; // Total Value Locked
  tokenStandard: string;
  complianceFramework: string[];
  lastAudit: string;
  oracleProvider?: string;
  collateralRatio?: number;
}

export interface RWAMetrics {
  totalAUM: number;
  growthRate: number;
  totalHolders: number;
  totalIssuers: number;
  tvlDeFi: number;
  dailyVolume: number;
  activeChains: number;
}

export interface Transaction {
  id: string;
  type: 'emission' | 'transfer' | 'settlement' | 'redemption' | 'cross-chain';
  asset: string;
  amount: number;
  from: string;
  to: string;
  blockchain: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  txHash: string;
  gasUsed?: number;
}

export interface RiskMetric {
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  threshold: number;
  status: 'safe' | 'warning' | 'critical';
}

// Mock RWA assets data based on real market
export const mockRWAAssets: TokenizedAsset[] = [
  {
    id: '1',
    symbol: 'BUIDL',
    name: 'BlackRock USD Institutional Digital Liquidity Fund',
    category: 'treasury',
    issuer: 'BlackRock',
    blockchain: ['Ethereum', 'Polygon', 'Avalanche'],
    aum: 2420000000, // $2.42B
    yield: 5.32,
    maturity: 'Perpetual',
    liquidityScore: 95,
    riskScore: 12,
    holders: 15234,
    dailyVolume: 125000000,
    price: 1.0001,
    changePercent: 0.01,
    change24h: 0.0001,
    marketCap: 2420000000,
    tvl: 2420000000,
    tokenStandard: 'ERC-20',
    complianceFramework: ['SEC Registered', 'FINRA Compliant'],
    lastAudit: '2024-12-15',
    oracleProvider: 'Chainlink',
    collateralRatio: 102
  },
  {
    id: '2',
    symbol: 'USYC',
    name: 'Hashnote Short Duration Yield Coin',
    category: 'treasury',
    issuer: 'Hashnote',
    blockchain: ['Ethereum', 'Base'],
    aum: 854000000,
    yield: 5.45,
    maturity: '3 months',
    liquidityScore: 88,
    riskScore: 15,
    holders: 8421,
    dailyVolume: 45000000,
    price: 1.0003,
    changePercent: 0.03,
    change24h: 0.0003,
    marketCap: 854000000,
    tvl: 854000000,
    tokenStandard: 'ERC-20',
    complianceFramework: ['SEC Exempt', 'Reg D'],
    lastAudit: '2024-12-01',
    oracleProvider: 'Pyth',
    collateralRatio: 100.5
  },
  {
    id: '3',
    symbol: 'OUSG',
    name: 'Ondo Short-Term US Government Treasuries',
    category: 'treasury',
    issuer: 'Ondo Finance',
    blockchain: ['Ethereum', 'Mantle', 'Polygon'],
    aum: 452000000,
    yield: 5.28,
    maturity: '1 month',
    liquidityScore: 92,
    riskScore: 10,
    holders: 6234,
    dailyVolume: 32000000,
    price: 105.42,
    changePercent: 0.12,
    change24h: 0.13,
    marketCap: 452000000,
    tvl: 452000000,
    tokenStandard: 'ERC-20',
    complianceFramework: ['SEC Registered'],
    lastAudit: '2024-11-30',
    oracleProvider: 'Chainlink',
    collateralRatio: 101
  },
  {
    id: '4',
    symbol: 'GFI',
    name: 'Goldfinch Senior Pool',
    category: 'private-credit',
    issuer: 'Goldfinch',
    blockchain: ['Ethereum'],
    aum: 312000000,
    yield: 8.75,
    maturity: '24 months',
    liquidityScore: 65,
    riskScore: 45,
    holders: 3421,
    dailyVolume: 8500000,
    price: 2.34,
    changePercent: -1.25,
    change24h: -0.03,
    marketCap: 312000000,
    tvl: 312000000,
    tokenStandard: 'ERC-20',
    complianceFramework: ['DeFi Native'],
    lastAudit: '2024-10-15',
    oracleProvider: 'Internal',
    collateralRatio: 120
  },
  {
    id: '5',
    symbol: 'MPL',
    name: 'Maple Finance Pool',
    category: 'private-credit',
    issuer: 'Maple Finance',
    blockchain: ['Ethereum', 'Solana'],
    aum: 256000000,
    yield: 9.2,
    maturity: '12 months',
    liquidityScore: 58,
    riskScore: 52,
    holders: 2103,
    dailyVolume: 5200000,
    price: 18.45,
    changePercent: 2.35,
    change24h: 0.42,
    marketCap: 256000000,
    tvl: 256000000,
    tokenStandard: 'ERC-20',
    complianceFramework: ['Cayman Islands'],
    lastAudit: '2024-11-01',
    collateralRatio: 130
  },
  {
    id: '6',
    symbol: 'CRED',
    name: 'Credix Emerging Markets Credit',
    category: 'private-credit',
    issuer: 'Credix',
    blockchain: ['Solana'],
    aum: 189000000,
    yield: 11.5,
    maturity: '18 months',
    liquidityScore: 42,
    riskScore: 68,
    holders: 1532,
    dailyVolume: 2300000,
    price: 0.98,
    changePercent: -0.5,
    change24h: -0.005,
    marketCap: 189000000,
    tvl: 189000000,
    tokenStandard: 'SPL',
    complianceFramework: ['RegTech Compliant'],
    lastAudit: '2024-09-30',
    collateralRatio: 150
  },
  {
    id: '7',
    symbol: 'RWA-RE',
    name: 'RealT Detroit Properties',
    category: 'real-estate',
    issuer: 'RealT',
    blockchain: ['Gnosis', 'Ethereum'],
    aum: 145000000,
    yield: 7.8,
    maturity: 'Perpetual',
    liquidityScore: 35,
    riskScore: 42,
    holders: 4231,
    dailyVolume: 850000,
    price: 52.30,
    changePercent: 1.2,
    change24h: 0.62,
    marketCap: 145000000,
    tvl: 145000000,
    tokenStandard: 'ERC-20',
    complianceFramework: ['SEC Reg A+'],
    lastAudit: '2024-08-15',
    collateralRatio: 100
  },
  {
    id: '8',
    symbol: 'PROPY',
    name: 'Propy Real Estate',
    category: 'real-estate',
    issuer: 'Propy',
    blockchain: ['Ethereum'],
    aum: 98000000,
    yield: 6.5,
    maturity: 'Perpetual',
    liquidityScore: 28,
    riskScore: 48,
    holders: 2156,
    dailyVolume: 420000,
    price: 3.45,
    changePercent: 3.8,
    change24h: 0.13,
    marketCap: 98000000,
    tvl: 98000000,
    tokenStandard: 'ERC-721',
    complianceFramework: ['International RE'],
    lastAudit: '2024-07-01'
  },
  {
    id: '9',
    symbol: 'PAXG',
    name: 'PAX Gold',
    category: 'commodity',
    issuer: 'Paxos',
    blockchain: ['Ethereum'],
    aum: 520000000,
    yield: 0,
    liquidityScore: 82,
    riskScore: 25,
    holders: 18923,
    dailyVolume: 25000000,
    price: 2632.50,
    changePercent: 0.85,
    change24h: 22.15,
    marketCap: 520000000,
    tvl: 520000000,
    tokenStandard: 'ERC-20',
    complianceFramework: ['NYDFS Regulated'],
    lastAudit: '2024-12-01',
    oracleProvider: 'Chainlink'
  },
  {
    id: '10',
    symbol: 'XAUT',
    name: 'Tether Gold',
    category: 'commodity',
    issuer: 'Tether',
    blockchain: ['Ethereum', 'Tron'],
    aum: 680000000,
    yield: 0,
    liquidityScore: 78,
    riskScore: 28,
    holders: 12456,
    dailyVolume: 18000000,
    price: 2631.80,
    changePercent: 0.82,
    change24h: 21.45,
    marketCap: 680000000,
    tvl: 680000000,
    tokenStandard: 'ERC-20',
    complianceFramework: ['Swiss Regulated'],
    lastAudit: '2024-11-15',
    oracleProvider: 'Oracle Network'
  }
];

// Mock transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'tx1',
    type: 'emission',
    asset: 'BUIDL',
    amount: 10000000,
    from: 'BlackRock Treasury',
    to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb4',
    blockchain: 'Ethereum',
    timestamp: new Date('2025-01-25T10:30:00'),
    status: 'completed',
    txHash: '0x1234567890abcdef',
    gasUsed: 125000
  },
  {
    id: 'tx2',
    type: 'cross-chain',
    asset: 'USYC',
    amount: 5000000,
    from: 'Ethereum',
    to: 'Base',
    blockchain: 'Wormhole',
    timestamp: new Date('2025-01-25T09:45:00'),
    status: 'completed',
    txHash: '0xabcdef1234567890'
  },
  {
    id: 'tx3',
    type: 'settlement',
    asset: 'OUSG',
    amount: 2500000,
    from: '0x123abc',
    to: '0x456def',
    blockchain: 'Polygon',
    timestamp: new Date('2025-01-25T08:15:00'),
    status: 'pending',
    txHash: '0xfedcba0987654321'
  },
  {
    id: 'tx4',
    type: 'redemption',
    asset: 'GFI',
    amount: 1000000,
    from: '0x789ghi',
    to: 'Goldfinch Treasury',
    blockchain: 'Ethereum',
    timestamp: new Date('2025-01-24T16:20:00'),
    status: 'completed',
    txHash: '0x1111222233334444'
  }
];

// Calculate metrics
export function calculateRWAMetrics(): RWAMetrics {
  const totalAUM = mockRWAAssets.reduce((sum, asset) => sum + asset.aum, 0);
  const totalHolders = mockRWAAssets.reduce((sum, asset) => sum + asset.holders, 0);
  const dailyVolume = mockRWAAssets.reduce((sum, asset) => sum + asset.dailyVolume, 0);
  const uniqueChains = new Set(mockRWAAssets.flatMap(a => a.blockchain)).size;
  
  return {
    totalAUM,
    growthRate: 85, // 85% YoY growth
    totalHolders,
    totalIssuers: new Set(mockRWAAssets.map(a => a.issuer)).size,
    tvlDeFi: totalAUM * 0.4, // 40% locked in DeFi
    dailyVolume,
    activeChains: uniqueChains
  };
}

// Risk metrics
export const riskMetrics: RiskMetric[] = [
  {
    name: 'Liquidity Coverage Ratio',
    value: 135,
    trend: 'up',
    threshold: 100,
    status: 'safe'
  },
  {
    name: 'Collateralization Ratio',
    value: 108,
    trend: 'stable',
    threshold: 100,
    status: 'safe'
  },
  {
    name: 'Smart Contract Risk Score',
    value: 25,
    trend: 'down',
    threshold: 50,
    status: 'safe'
  },
  {
    name: 'Oracle Deviation',
    value: 0.8,
    trend: 'stable',
    threshold: 2,
    status: 'safe'
  },
  {
    name: 'Counterparty Risk',
    value: 45,
    trend: 'up',
    threshold: 60,
    status: 'warning'
  }
];

// Generate price history for RWA assets
export function generateRWAPriceHistory(days: number, basePrice: number, volatility: number = 0.5): number[] {
  const prices: number[] = [basePrice];
  
  for (let i = 1; i < days; i++) {
    const change = (Math.random() - 0.5) * volatility;
    const newPrice = prices[i - 1] * (1 + change / 100);
    prices.push(Number(newPrice.toFixed(4)));
  }
  
  return prices;
}

// Format large numbers
export function formatValue(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

// Get assets by category
export function getAssetsByCategory(category: string): TokenizedAsset[] {
  return mockRWAAssets.filter(asset => asset.category === category);
}

// Calculate portfolio metrics
export function calculatePortfolioMetrics(assets: TokenizedAsset[]) {
  const totalValue = assets.reduce((sum, asset) => sum + asset.aum, 0);
  const avgYield = assets.reduce((sum, asset) => sum + asset.yield * asset.aum, 0) / totalValue;
  const avgRisk = assets.reduce((sum, asset) => sum + asset.riskScore * asset.aum, 0) / totalValue;
  const avgLiquidity = assets.reduce((sum, asset) => sum + asset.liquidityScore * asset.aum, 0) / totalValue;
  
  return {
    totalValue,
    avgYield,
    avgRisk,
    avgLiquidity,
    diversificationScore: calculateDiversification(assets)
  };
}

// Calculate diversification score
function calculateDiversification(assets: TokenizedAsset[]): number {
  const categories = new Set(assets.map(a => a.category)).size;
  const issuers = new Set(assets.map(a => a.issuer)).size;
  const chains = new Set(assets.flatMap(a => a.blockchain)).size;
  
  // Score based on diversity across categories, issuers, and chains
  const categoryScore = Math.min(categories / 4 * 40, 40); // Max 40 points
  const issuerScore = Math.min(issuers / 10 * 30, 30); // Max 30 points
  const chainScore = Math.min(chains / 5 * 30, 30); // Max 30 points
  
  return categoryScore + issuerScore + chainScore;
}

// Real-time data simulation hook
import { useState, useEffect } from 'react';

export function useRWAData(assets: TokenizedAsset[]) {
  const [data, setData] = useState(assets);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => 
        prevData.map(asset => ({
          ...asset,
          price: asset.price * (1 + (Math.random() - 0.5) * 0.001),
          changePercent: asset.changePercent + (Math.random() - 0.5) * 0.1,
          dailyVolume: asset.dailyVolume * (0.9 + Math.random() * 0.2)
        }))
      );
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [assets]);
  
  return data;
}

// Export formatNumber function for formatting large numbers
export function formatNumber(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}