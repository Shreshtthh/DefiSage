import { createTool } from '@iqai/adk';
import axios from 'axios';
import { z } from 'zod';

export const myxPerpDataTool = createTool({
  name: 'query_myx_perps',
  description: 'Query MYX Finance perpetual trading data on BNB Chain — markets, funding rates, and liquidity pools',
  schema: z.object({
    action: z.enum(['markets', 'funding_rates', 'liquidity']).describe('Type of perp data to retrieve'),
    pair: z.string().optional().describe('Trading pair filter (e.g., "BTC", "ETH")')
  }),
  fn: async (params: {
    action: 'markets' | 'funding_rates' | 'liquidity';
    pair?: string;
  }) => {
    try {
      const baseUrl = 'https://api.myx.finance';
      const url = `${baseUrl}/v2/quote/market/contracts`;

      const response = await axios.get(url, { timeout: 10000 });
      let data = response.data;

      // Filter by pair if specified
      if (params.pair && data.data) {
        data.data = data.data.filter((item: any) =>
          item.symbol?.toUpperCase().includes(params.pair?.toUpperCase() || '')
        );
      }

      return JSON.stringify({
        success: true,
        data: data.data || data,
        source: 'MYX Finance API',
        action: params.action,
        description: 'MYX Finance — Decentralized Perpetual Exchange on BNB Chain'
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'MYX Finance API may be temporarily unavailable. MYX is a decentralized perpetual exchange on BNB Chain offering up to 50x leverage with near-zero slippage.'
      });
    }
  }
});
