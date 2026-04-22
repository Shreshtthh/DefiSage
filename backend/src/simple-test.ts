import 'dotenv/config';
import { Runner, InMemorySessionService } from '@iqai/adk';
import { coordinatorAgent } from './agents/coordinator/coordinator-agent';

async function main() {
  console.log('🚀 DefiSage - Web3 Research & Execution Agent');
  console.log('================================================\n');

  // Validate environment
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY not set in .env file');
  }

  console.log('✅ Environment configured\n');

  try {
    // CORRECT PATTERN FROM DOCS: Use Runner directly
    const sessionService = new InMemorySessionService();
    const session = await sessionService.createSession('DefiSage', 'user123');

    const runner = new Runner({
      appName: 'DefiSage',
      agent: coordinatorAgent,
      sessionService: sessionService
    });

    console.log(`📋 Session created: ${session.id}\n`);

    // Example query
    const exampleQuery = "What are the top DeFi protocols?";
    console.log(`🔍 Running query: "${exampleQuery}"\n`);
    console.log('─'.repeat(80));

    // Run query using runAsync
    for await (const event of runner.runAsync({
      userId: 'user123',
      sessionId: session.id,
      newMessage: {
        parts: [{ text: exampleQuery }]
      }
    })) {
      // Check for final response
      if (event.isFinalResponse && event.isFinalResponse()) {
        console.log('\n📋 Final Response:');
        console.log(event.content?.parts?.[0]?.text || 'No response');
      } else if (event.getFunctionCalls) {
        const calls = event.getFunctionCalls();
        if (calls.length > 0) {
          console.log(`🔧 Tool calls: ${calls.map(c => c.name).join(', ')}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }

  console.log('\n' + '─'.repeat(80));
  console.log('✅ Query completed!\n');
}

main().catch(console.error);
