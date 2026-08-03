export interface Lead {
  id: number;
  username: string;
  followers: number;
  niche: string;
  status: 'pendente' | 'enviada' | 'erro' | 'blacklist';
  score: number;
  date: string;
  avatar?: string;
}

export interface SystemStatus {
  mining: boolean;
  sending: boolean;
}

export interface ScraperConfig {
  hashtags: string;
  minFollowers: number;
  maxFollowers: number;
  maxPerTag: number;
  proxyEnabled: boolean;
  proxyUrl: string;
  turboMode: boolean;
}

export interface LogMessage {
  id: string;
  type: 'system' | 'miner' | 'miner_error' | 'sender' | 'sender_error';
  text: string;
  timestamp: string;
}
