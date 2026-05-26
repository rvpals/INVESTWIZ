export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Portfolio {
  id: string;
  name: string;
  currency: string;
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  holdingsCount: number;
  createdAt: string;
}

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  assetType: AssetType;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedGain: number;
  unrealizedGainPercent: number;
}

export interface Transaction {
  id: string;
  symbol: string;
  type: TransactionType;
  quantity: number;
  price: number;
  fees: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  updatedAt: string;
}

export interface Watchlist {
  id: string;
  name: string;
  symbols: string[];
  createdAt: string;
}

export interface Alert {
  id: string;
  symbol: string;
  condition: 'above' | 'below';
  targetPrice: number;
  currentPrice: number;
  active: boolean;
  triggeredAt: string | null;
  createdAt: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string | null;
  monthlyContribution: number | null;
  linkedPortfolioIds: string[];
  createdAt: string;
}

export type AssetType = 'stock' | 'etf' | 'crypto' | 'bond' | 'mutual_fund' | 'real_estate';

export type TransactionType = 'buy' | 'sell' | 'dividend' | 'split' | 'transfer_in' | 'transfer_out';
