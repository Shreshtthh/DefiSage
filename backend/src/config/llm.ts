import 'dotenv/config';
import axios from 'axios';

/**
 * DGrid AI Gateway integration.
 * 
 * Agents use native Gemini model (best compatibility with ADK-TS).
 * DGrid is used for supplementary AI analysis via its OpenAI-compatible API.
 */

// Agent model — always Gemini (ADK-TS native support)
export function getLlmModel() {
  return 'gemini-3.1-flash-lite-preview';
}

/**
 * Query DGrid AI Gateway directly (OpenAI-compatible API).
 * Used for AI-powered analysis of DeFi data, summaries, and insights.
 * 
 * Docs: https://docs.dgrid.ai/AI-Gateway
 * Model format: [provider]/[model-name]
 */
export async function queryDGrid(prompt: string, systemPrompt?: string): Promise<string> {
  const apiKey = process.env.DGRID_API_KEY;
  
  if (!apiKey) {
    console.log('⚠️ DGRID_API_KEY not set, skipping DGrid query');
    return '';
  }

  try {
    const response = await axios.post(
      'https://api.dgrid.ai/v1/chat/completions',
      {
        model: 'google/gemini-3.1-flash-lite-preview',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        max_tokens: 1024,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://defisage.app',
          'X-Title': 'DefiSage',
        },
        timeout: 30000,
      }
    );

    const result = response.data.choices?.[0]?.message?.content || '';
    console.log('✅ DGrid AI Gateway response received');
    return result;
  } catch (error: any) {
    console.error('❌ DGrid query failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data));
    }
    return '';
  }
}
