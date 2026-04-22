import { createTool } from '@iqai/adk';
import axios from 'axios';
import { z } from 'zod';

export const blockchainQueryTool = createTool({
  name: 'query_blockchain',
  description: 'Query blockchain data including balances, transactions, and token transfers via BscScan API on BNB Chain',
  schema: z.object({
    address: z.string().optional().describe('Wallet address to query'),
    action: z.enum(['balance', 'txlist', 'tokentx']).describe('Type of data to retrieve')
  }),
  fn: async (params: { 
    address?: string; 
    action: 'balance' | 'txlist' | 'tokentx';
  }) => {
    try {
      const apiKey = process.env.BSCSCAN_API_KEY;
      if (!apiKey) {
        return JSON.stringify({
          success: false,
          error: 'BscScan API key not configured',
          details: 'Set BSCSCAN_API_KEY in .env for blockchain explorer queries'
        });
      }
      const baseUrl = 'https://api-testnet.bscscan.com/api';
      
      const response = await axios.get(baseUrl, {
        params: {
          module: 'account',
          action: params.action,
          address: params.address,
          apikey: apiKey,
        }
      });

      return JSON.stringify({
        success: true,
        data: response.data.result,
        source: 'BscScan API'
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});
