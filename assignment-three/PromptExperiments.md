[Return to README](../README.md)
### 1st Prompt
On my first attempt, I had a very simple prompt.
`
        You are a helpful study aid attempting to create templates for flashcard prompts.
        Specifically, you are a study aid that looks to connect cues and responses using Bloom's Taxonomy.

        GOAL:
        Create a reusable template based on the following inputs.

        NAME DESCRIPTION:
        ${namePrompt}

        STRUCTURE DESCRIPTION:
        ${structurePrompt}

        RESPONSE REQUIREMENTS:
        Return ONLY a JSON object with the following exact structure:

        {
        "name": "short name for the template",
        "structure": "the template text, using placeholders like {variable_name}",
        "placeholders": ["list", "of", "placeholders", "used", "in", "structure"]
        }
        `

### Thoughts and 2nd suite/prompt
At first, I thought that having a prompt this simple would be useful in at least getting the AI output to be functional, but I soon realized that it became impossible to create test cases that really made the AI 'fail'. This was because the prompt was so minimal that grading the AI output based on the prompt itself resulted in zero information. The prompt was so general that it may as well have been regular rule-based code, because it didn't impose a strict enough rubric. Motivated by my dissatisfaction with the first suite of test cases, I amended the prompt to this:



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

7. If you cannot produce a useful template, return an empty JSON with an empty placeholders array.

### Thoughts and 3rd prompt
With this prompt, what I found that generally the output of the llm was overly verbose while still accurate, but I still had the issue of failing to meet pedagogical utility. In my mind's eye, I wanted the llm to understand that even if the user gave a very specific structure, the goal was to distill it to its essence given the context of its name. Keeping this in mind, I realized that I had yet to explain to the llm what bloom's taxonomy actually was, assuming that whatever model has already scraped that kind of information off of the web.

By amending the prompt to include this:

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

I found that more test cases were generating templates that were actually useful, and more importantly, templates that were avoiding direct reference to the concepts provided, and instead attempting to generalize toward getting across associations. (i.e, even when handed a structure that directly mentioned Prim and Kruskal's algorithms for MSTs, generalized to comparing and contrasting algorithm_one, algorithm_two for problem_type). In order to reinforce this behaviour further, I amended the prompt to be more specific in how I wanted the llm to go about dissecting the problem by adding more core tenets.

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
       
### Thoughts on final prompt
My idea was that although this felt slighlty more loose than the prompt before it because it labeled some requirements as general guidelines, I figured that maybe giving the llm tis directives similar to how a human would be given them could help it generalize. In this, I noticed that it did do better, especially with verbose structure, at parsing our specific examples and instead moving toward generalizable templates, but it still had problems doing it with terse ones.