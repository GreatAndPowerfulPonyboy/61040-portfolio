import { error } from 'console';
import { GeminiLLM } from './gemini-llm';
/**
 * Templating Concept - AI Augmented Version
 */


// A template that can produce items
export interface Template {
    name: string,
    structure: string,
    placeholders: string[],
    items: Set<Item>,
    
}

export interface Item {
    templates: Set<Template>, // Templates the item is derived from
    fillIns: string[], // Values filled into placeholders
    value : string 

}

export class AiTemplating {
    private templates: Set<Template> = new Set<Template>();
    private items: Set<Item> = new Set<Item>();

    /**
     * Creates a new template
     * @param name name of the template
     * @param structure structure of the template (i.e the words in the template that are not to be filled in by placeholders)
     * @param placeholders string values denoting variables to be filled in by future strings
     * @returns A new template with the defined name, structure, and placeholders
     */
    createTemplate(name: string, structure: string, placeholders: Array<string>) : Template {
        const newTemplate: Template = {
            name,
            structure,
            placeholders,
            items: new Set<Item>()

        };
        this.templates.add(newTemplate);
        return newTemplate;
    }

    /**
     * Create a new item from the template
     * @param template Template to be used as structure, must be in the set of templates
     * @param values Values to be filled in as placeholders, values must match the length of the template's placeholders
     * @returns A new item composed of the template's structure with placeholder values filled in by the sent values
     */
    produce(template: Template, values: string[]): Item {
        if(!this.templates.has(template)) {
            throw new Error("Template does not exist in the current set of templates");
        }
        if(values.length !== template.placeholders.length) {
            throw new Error("Length of values does not match length of placeholders!");
        }

        // Create the item's string by replacing placeholders

        let filledValue = template.structure;
        
        template.placeholders.forEach((ph,idx) => {
            // Replace all instances of {placeholder} with their value
            const regex = new RegExp(`{${ph}}`, "g")
            filledValue = filledValue.replace(regex, values[idx])
        })

        // Make the Item

        const newItem: Item = {
            templates: new Set([template]),
            fillIns: values,
            value: filledValue
        };

        // Associate item with its derived template
        this.items.add(newItem);
        template.items.add(newItem);

        return newItem;
    }
    

    /**
     * Updates a template, updating any items derived from the template retroactively if designated.
     * @param template Template to be updated, must be in the set of templates
     * @param newName Name of the updated template
     * @param newStructure Structure of the updated template
     * @param newPlaceholders Placeholder values of the new template
     * @param retroactive Boolean designating whether or not to apply changes retroactively
     * @returns The new template and a set of all updated items
     */
    update(template: Template,  newName: string, newStructure: string, newPlaceholders: Array<string>, retroactive: boolean) : {newTemplate: Template, updatedItems: Set<Item>} {
        
        if(!this.templates.has(template)) {
            throw new Error("Template does not exist")
        }
        const newTemplate: Template = this.createTemplate(newName, newStructure, newPlaceholders);
        this.templates.delete(template);
        this.templates.add(newTemplate);
        const updatedItems: Set<Item> = new Set<Item>();
        // Apply retroactive changes
        if (retroactive) {
            template.items.forEach(item => {
                // Create the item's new fillins
                const newFillIns = newPlaceholders.map(ph => {
                    // If the placeholder is the same between templates, reuse the olde placeholder
                    const oldIndex = template.placeholders.indexOf(ph);
                    return oldIndex >= 0? item.fillIns[oldIndex] : ""; 
                })              
                
                // Create the item's new value
                let filledValue = newTemplate.structure;
                newTemplate.placeholders.forEach((ph,idx) => {
                    const newRegex = new RegExp(`{${ph}}`,'g');
                    filledValue = filledValue.replace(newRegex, newFillIns[idx]);
                })

                item.fillIns = newFillIns;
                item.value = filledValue;
                newTemplate.items.add(item);
                updatedItems.add(item);
            })
        }
        return {newTemplate, updatedItems};
    };

    /**
     * Deletes a template, removing all items derived from it retroactively if necessary
     * @param template Template to be removed, must be in the set of templates
     * @param retroactive Boolean designating whether to apply deletion retroactively to derived items
     * @returns The set of all removed items
     */
    delete(template: Template, retroactive:boolean) : {removedTemplate: Template, removedItems: Set<Item>} {
        if(!(this.templates.has(template))) {
            throw new Error("Template does not exist!");
        }
        const removedItems = new Set<Item>();
        if (retroactive) {
            template.items.forEach(item => {
                removedItems.add(item);
                this.items.delete(item);
            })
        }
        this.templates.delete(template);
        return {removedTemplate: template, removedItems};
    }

private parseAndApplyTemplateResponse(rawText: String): Template {
    // Parsing the llm response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in LLM response.");

    let parsed;
    try {
        parsed = JSON.parse(jsonMatch[0]);
    } catch {
        throw new Error("Malformed JSON returned by LLM.");
    }

    const { name, structure, placeholders } = parsed;
    if (typeof name !== "string" || typeof structure !== "string" || !Array.isArray(placeholders)) {
        throw new Error("Invalid format: must contain name, structure, and placeholders.");
    }

    // Validating the response
    // 1. Checking for placeholder consistency
       const missing = placeholders.filter(ph => !structure.includes(`{${ph}}`));
    if (missing.length > 0) throw new Error(`Placeholders missing in structure: ${missing.join(", ")}`);

    const extraMatches = [...structure.matchAll(/\{(.*?)\}/g)].map(m => m[1])
        .filter(ph => !placeholders.includes(ph));
    if (extraMatches.length > 0) throw new Error(`Undeclared placeholders found: ${extraMatches.join(", ")}`);
    
    // 2. Length checks
    if (name.trim().length === 0 || structure.trim().length === 0) {
        throw new Error("Name or structure cannot be empty.");
    }

    if (placeholders.length > 10) {
        throw new Error("Too many placeholders — LLM likely misunderstood the task.");
    }

    if (structure.length > 500) {
        throw new Error("Structure length too long - LLM failed conciseness.");
    }
    // 3. Pedagogical heuristic checks
    const lower = structure.toLowerCase();
    const genericWords = ["explain", "compare", "justify", "design", "analyze"];
    if (!genericWords.some(w => lower.includes(w))) {
        throw new Error("Structure likely not pedagogically useful — missing higher-order action verb.");
    }

    // With checks passed, return a new Template object
    return this.createTemplate(name, structure, placeholders);
}

/**
 * Executes an LLM call with timeout and exponential backoff retries.
 */
private async callLLMWithRetry(
    llm: GeminiLLM,
    prompt: string,
    maxRetries: number,
    timeoutMs: number
): Promise<string> {
    let attempt = 0;

    while (attempt <= maxRetries) {
        try {
            // Promise.race enforces timeout
            const result = await Promise.race([
                llm.executeLLM(prompt),
                new Promise<string>((_, reject) =>
                    setTimeout(() => reject(new Error("Timeout: LLM did not respond in time")), timeoutMs)
                )
            ]);
            return result; 

        } catch (error) {
            attempt++;
            const delay = Math.pow(2, attempt) * 500; // exponential backoff: 0.5s, 1s, 2s, 4s...
            console.warn(`⚠️ LLM call failed (attempt ${attempt}/${maxRetries}): ${(error as Error).message}`);

            if (attempt > maxRetries) throw new Error("LLM request failed after maximum retries");
            console.log(`⏳ Retrying in ${delay / 1000}s...`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
    throw new Error("Unexpected error in LLM retry loop");
}

async createTemplateWithAI(llm: GeminiLLM, namePrompt: string, structurePrompt: string, bloomlevel: string): Promise<Template> {
    try {
        console.log("🤖 Requesting template creation from Gemini AI...");

        const prompt = this.createTemplatePrompt(namePrompt, structurePrompt, bloomlevel);
        const text = await this.callLLMWithRetry(llm,prompt,3,3000);

        console.log("✅ Received response from Gemini AI!");
        console.log("\n🤖 RAW GEMINI RESPONSE");
        console.log("======================");
        console.log(text);
        console.log("======================\n");

       return this.parseAndApplyTemplateResponse(text);
    } catch (error) {
        console.error("❌ Error creating template via LLM:", (error as Error).message);
        throw error;
    }
}



private createTemplatePrompt(namePrompt: string, structurePrompt: string, bloomlevel: string): string {
    const criticalRequirements = `
    1. The template must have **at least one placeholder**.
    2. Each placeholder must be **short, descriptive, and lowercase_with_underscores**.
    3. Avoid more than 5 placeholders (too complex for learners).
    4. The structure text should be **concise** (<50 words) and directly related to the learning objective.
    5. Do not include explanations, examples, or additional text in the structure — it should only define the template itself.
    6. Return **only valid JSON** using this exact structure:
    {
    "name": "short descriptive name for the template",
    "structure": "template text using placeholders like {placeholder_name}",
    "placeholders": ["list", "of", "placeholders", "used"]
    }
    7. For a defined bloom level, you MUST use at least one of the verbs or prompts consistent with that level


    8. If you cannot produce a useful template, return an empty JSON with an empty placeholders array.` 
        return `
        You are a study assistant tasked with creating flashcard templates to help learners engage with concepts at a specific Bloom's Taxonomy cognitive level. 
        Bloom's Levels:
        - Remember: recall facts or definitions 
        - Understand: Explain ideas or concepts
        - Apply: Use knowledge in new situations
        - Analyze: Compare, contrast, categorize, and identify patterns
        - Evaluate: Justify decisions, critique approaches, and weight alternatives
        - Create: Produce new work or solutions
        GOAL:
        Given a concept or topic, produce a reusable template that encourage the type of thinking associated with the Bloom's level: ${bloomlevel} 

        NAME DESCRIPTION:
        ${namePrompt}

        STRUCTURE DESCRIPTION:
        ${structurePrompt}

        RESPONSE REQUIREMENTS:

        ${criticalRequirements}

        
        General Guidelines:
        1. Generalizations over Specificity:
        - if the NAME or STRUCTURE decsription mentions specific algorithms, examples, or data, the template should generalize these into placeholders
        - Avoid hard-coding specific names (e.g. "Prim" or "Kruskal"). Instead, use placeholders like {algorithm_a} and {algorithm_b}
        - The goal is to produce reusable templates suitable for multiple items, and to get at the underlying associatiosn the user is trying to make
        2. How to align with Bloom's Taxonomy
        - Consider the intended cognitive level (e.g., analyze, evaluate, create). 
        - Include verbs and prompts consistent with that level:
            - Remember: list, define, recall
            - Understand: explain, describe, summarize
            - Apply: apply, implement, use
            - Analyze: compare, contrast, differentiate
            - Evaluate: justify, critique, assess
            - Create: design, construct, generate
        - Even if the structure description is vague, ensure the generated structure scaffolds the intended Bloom’s skill.
        3. Pedagogical utility
        - Ensure the generated template attempts to scaffold student reasoning
        - The template should give learners a clear task or question to engage with
        - Focus on actions the learner should take
        4. Ensure that each placeholder is generalizable so that multiple items can be generated from the same template.
        5. Avoid embedding specific examples in the template text itself; use placeholders instead.
        `
}

    /**
     * Pretty-print a single template and its summary.
     */
    toStringTemplate(template: Template): string {
        const placeholders = template.placeholders.length > 0
            ? template.placeholders.join(", ")
            : "none";

        const itemCount = template.items.size;
        const itemPreview = Array.from(template.items)
            .map(item => `    - ${item.value}`)
            .join("\n");

        return [
            `🧩 Template "${template.name}"`,
            `  Structure: "${template.structure}"`,
            `  Placeholders: [${placeholders}]`,
            `  Items (${itemCount} total):`,
            itemPreview || "    - none"
        ].join("\n");
    }

    /**
     * Pretty-print a single item and its origins.
     */
    toStringItem(item: Item): string {
        const templates = Array.from(item.templates)
            .map(t => t.name)
            .join(", ") || "none";

        const fills = item.fillIns.length > 0
            ? item.fillIns.join(", ")
            : "none";

        return [
            `📝 Item`,
            `  Value: "${item.value}"`,
            `  Fill-ins: [${fills}]`,
            `  Derived from: [${templates}]`
        ].join("\n");
    }

    /**
     * Print *all* templates in the system in a compact summary.
     */
    toStringAllTemplates(): string {
        return Array.from(this.templates)
            .map(t => this.toStringTemplate(t))
            .join("\n\n");
    }

    /**
     * Print *all* items in the system.
     */
    toStringAllItems(): string {
        return Array.from(this.items)
            .map(i => this.toStringItem(i))
            .join("\n\n");
    }}
