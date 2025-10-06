/**
 * AiTemplating Test Cases
 * 
 * Demonstrates both manual templating and LLM-Assisted Templating
 */

import { AiTemplating } from './templating';
import { GeminiLLM, Config } from './gemini-llm';

/**
 * Load configuration from config.json
 */
function loadConfig(): Config {
    try {
        const config = require('../config.json');
        return config;
    } catch (error) {
        console.error('❌ Error loading config.json. Please ensure it exists with your API key.');
        console.error('Error details:', (error as Error).message);
        process.exit(1);
    }
}


/**
 * TEST CASE 1 — Manual Template Creation
 *
 * Demonstrates creating templates and items manually without LLM help.
 */
export async function testManualTemplates(): Promise<void> {
    console.log('\n🧪 TEST CASE 1: Manual Template Creation');
    console.log('========================================');

    const ai = new AiTemplating();

    console.log('🧩 Creating templates manually...');
    const greeting = ai.createTemplate('Greeting', 'Hello {name}!', ['name']);
    const reminder = ai.createTemplate('Reminder', 'Don’t forget to {task} at {time}.', ['task', 'time']);

    console.log('\n📝 Producing items manually...');
    const greetingJack = ai.produce(greeting, ['Jack']);
    const reminderCall = ai.produce(reminder, ['call Mom', '5 PM']);

    console.log('\n📜 Template Details:');
    console.log(ai.toStringTemplate(greeting));
    console.log();
    console.log(ai.toStringTemplate(reminder));

    console.log('\n🧾 Item Details:');
    console.log(ai.toStringItem(greetingJack));
    console.log();
    console.log(ai.toStringItem(reminderCall));
}


/**
 * TEST CASE 2 — LLM-Assisted Template Generation - Simple case
 *
 * Demonstrates the LLM proposing a new template and placeholder mapping.
 */
export async function testLLMAssistedTemplate(): Promise<void> {
    console.log('\n🧪 TEST CASE 2: LLM-Assisted Template Generation');
    console.log('=================================================');

    const ai = new AiTemplating();
    const config = loadConfig();
    const llm = new GeminiLLM(config);

    console.log('🤖 Asking LLM to suggest new templates...');
    const namePrompt: string = 'Sorting Algorithms'
    const structurePrompt: string = 'Compare and contrast the runtime and memory usage between two different sorting algorithms'
    const response = await ai.createTemplateWithAI(llm,namePrompt,structurePrompt, 'apply');
    console.log('✅ LLM suggested:', ai.toStringTemplate(response));

    console.log('\n🧾 Producing one sample item for the template...');

    console.log(ai.toStringItem(ai.produce(response, response.placeholders.map(ph => `sample_${ph}`))))

}


/**
 * TEST CASE 3 — LLM-Assisted Template Generation - Difficult case
 *
 * Check how the llm handles a structure that's overly detailed
 */
export async function testLLMAssistedTemplateVerboseStructure(): Promise<void> {
    console.log('\n🧪 TEST CASE 3: LLM-Assisted Template Generation overly verbose structure');
    console.log('=================================================');

    const ai = new AiTemplating();
    const config = loadConfig();
    const llm = new GeminiLLM(config);

    console.log('🤖 Asking LLM to suggest new templates...');
    const namePrompt: string = 'Divide and conquer'
    const structurePrompt: string = 'Explain the merge sort algorithm. Make sure to include details such as runtime, proof of correctness, and insights behind the combine step.'
    const response = await ai.createTemplateWithAI(llm,namePrompt,structurePrompt, 'understand');
    console.log('✅ LLM suggested:', ai.toStringTemplate(response));

    console.log('\n🧾 Producing one sample item for the template...');

    console.log(ai.toStringItem(ai.produce(response, response.placeholders.map(ph => `sample_${ph}`))))

}

/**
 * TEST CASE 4 — LLM-Assisted Template Generation - Difficult case
 *
 * Check how the llm handles a structure that's overly terse
 */
export async function testLLMAssistedTemplateTerseStructure(): Promise<void> {
    console.log('\n🧪 TEST CASE 4: LLM-Assisted Template Generation overly terse structure');
    console.log('=================================================');

    const ai = new AiTemplating();
    const config = loadConfig();
    const llm = new GeminiLLM(config);

    console.log('🤖 Asking LLM to suggest new templates...');
    const namePrompt: string = 'Divide and conquer'
    const structurePrompt: string = 'Explain merge'
    const response = await ai.createTemplateWithAI(llm,namePrompt,structurePrompt, 'understand');
    console.log('✅ LLM suggested:', ai.toStringTemplate(response));

    console.log('\n🧾 Producing one sample item for the template...');

    console.log(ai.toStringItem(ai.produce(response, response.placeholders.map(ph => `sample_${ph}`))))

}

/**
 * TEST CASE 5 — LLM-Assisted Template Generation - Difficult cases
 *
 * Check how the llm handles a mismatch between name and structure
 */
export async function testLLMAssistedTemplateMismatchedStructure(): Promise<void> {
    console.log('\n🧪 TEST CASE 5: LLM-Assisted Template Generation mismatched structure');
    console.log('=================================================');

    const ai = new AiTemplating();
    const config = loadConfig();
    const llm = new GeminiLLM(config);

    console.log('🤖 Asking LLM to suggest new templates...');
    const namePrompt: string = 'Divide and conquer'
    const structurePrompt: string = 'Compare and contrast Prim and Kruskal approaches to Minimum Spanning Trees'
    const response = await ai.createTemplateWithAI(llm,namePrompt,structurePrompt, 'analyze');
    console.log('✅ LLM suggested:', ai.toStringTemplate(response));

    console.log('\n🧾 Producing one sample item for the template...');

    console.log(ai.toStringItem(ai.produce(response, response.placeholders.map(ph => `sample_${ph}`))))

}
/**
 * MAIN TEST RUNNER
 */
async function main(): Promise<void> {
    console.log('🎓 AiTemplating Test Suite');
    console.log('==========================\n');

    try {
        await testManualTemplates();
        await testLLMAssistedTemplate();
        await testLLMAssistedTemplateTerseStructure();
        await testLLMAssistedTemplateVerboseStructure();
        await testLLMAssistedTemplateMismatchedStructure();

        console.log('\n🎉 All test cases completed successfully!');
    } catch (error) {
        console.error('❌ Test error:', (error as Error).message);
        process.exit(1);
    }
}

// Run the tests if executed directly
if (require.main === module) {
    main();
}
