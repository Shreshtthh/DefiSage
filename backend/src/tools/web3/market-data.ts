import { createTool } from '@iqai/adk';
import axios from 'axios';
import { z } from 'zod';

export const marketDataTool = createTool({
  name: 'query_market_data',
  description: 'Query cryptocurrency market data including prices, charts, and trending coins from CoinGecko',
  schema: z.object({
    coinId: z.string().optional().describe('CoinGecko coin ID (e.g., "ethereum", "bitcoin")'),
    action: z.enum(['price', 'market_chart', 'trending']).describe('Type of market data to retrieve')
  }),
  fn: async (params: { 
    coinId?: string;
    action: 'price' | 'market_chart' | 'trending';
  }) => {
    try {
      const baseUrl = 'https://api.coingecko.com/api/v3';
      let url = baseUrl;
      
      switch (params.action) {
        case 'price':
          url += `/simple/price?ids=${params.coinId || 'ethereum'}&vs_currencies=usd&include_24hr_change=true`;
          break;
        case 'market_chart':
          url += `/coins/${params.coinId || 'ethereum'}/market_chart?vs_currency=usd&days=7`;
          break;
        case 'trending':
          url += '/search/trending';
          break;
      }

      const response = await axios.get(url);

      return JSON.stringify({
        success: true,
        data: response.data,
        source: 'CoinGecko API'
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});
