[Return to README](../README.md)
When interpreting the LLM response, three issues could've occurred. 

**First**, the model could just produce malformed or incomplete JSON. It coud omit brackets, miss required placeholders, or return extra text around the JSON. To try and amend this, we validate by extracting the JSon substring with a regex and throw errors if any of the required fiels are missing or of the wrong type. 

**Second** The LLM might create inconsistent placeholders such that it lists placeholders that don't appear in the structure or uses undeclared placeholders within the braces. The validator attempts to cross-check declared and actual placeholders and throw errors when there are mismatches.

**Third** The model could generate structure that are just pedagogically weak or incoherent. For example, it could the kinds of action verbs or structures that match the style of Bloom's Taxonomy. To deal with this, the validator includes a heuristic check that verifies that there exists at least one higher-order action verb and also limits placeholder counts to prevent runaway or misinterpreted outputs.