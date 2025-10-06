[Return to README](../README.md)
## Original Concept
**Concept** Templating[Item]

****Purpose**** Allows users to quickly create and update new Items as defined by a specified structure

****Principle**** A template defines placeholders. Users can instantiate templates by filling placeholders to produce new items. At any time, users can update or remove a template and decide whether or not to retroactively apply those changes to the items created from the template.

****State****
A set of Templates with
	a String name
	a String structure
	a set of String placeholders
	a set of Items

A set of Items with
	a set of templates
	a set of String values

**Actions**
	create(name: String, structure: String, placeholders: set[String]) : (template: Template)
	requires placeholders is non-empty
	effects Create a new template with given name, structure, and set of placeholders

	produce(template: Template, values: set[String[) : (item: Item)
	requires template exists, length of values is at least the length of placeholders
	effects Create a new item from the template, such that as many values as possible fill in the placeholders of the template's structure. Any excess values are not included.

	update(template: Template, newStructure: String, newPlaceholders: set[String], newname: string, retroactive: bool)
	requires template exists
	effects Replace the template's name, structure, and placeholder with its new values.  

	delete(template: Template)
	requires template exists
	effects remove the template. 

## Ai Augmented Concept

**Concept** AITemplating[Item]

****Purpose**** Allows users to quickly create and update new Items as defined by a specified structure

****Principle**** If a user finds that they want to create items of a similar pattern, they can create a template for an item by defining a structure and placeholders. The user also has the choice of an AI suggestion for the template's structure and set of placeholders instead of providing their own. If they do not like the model's choice, they can return to manual creation of structure and placeholders. Users can also instantiate a template by prompting an llm with a set of previous items and a prompt detailing how they should be composed. After creating a template, users can instantiate items from templates by filling in placeholders. A user can update a template at any time, and decide whether or not they want to retroactively update all items produced by the template. A user can also delete a template, with the same choice of retroactive changes.

****State****
A set of Templates with
	a String name
	a String structure
	a set of String placeholders
	a set of Items

A set of Items with
	a set of templates
	a String value
	a set of String FillIns

**Actions**
	create(name: String, structure: String, placeholders: set[String], prompt?: String) : (template: Template)
	requires prompt exists XOR ((structure exists and placeholders are not empty))
	effects If there is no prompt, create a new template with given name, structure, and set of placeholders. If there is a prompt, generate a new template with a combination of the user's prompt and the context that is given.

    <!-- createtemplatefromitems(name: String, items: Set[Item], prompt: String) : (template: Template)
    requires name and prompt exist.
    effects Creation of a template using the context of the template's name and the set of items sent in.  -->

	produce(template: Template, values: set[String[) : (item: Item)
	requires template exists, length of values is exactly the length of the template's placeholders.
	effects Create a new item from the template with the placeholders of the template replaced by the values.

	update(template: Template, newStructure: String, newPlaceholders: set[String], newname: string, retroactive: bool) : (newTemplate: template, updatedItems: set[Item])
	requires template belongs to the set of templates
	effects Return a new template with a replacement of the template's name, structure, and placeholder with its new values. If retroactive is true, apply this update to all items created from the template. Values for placeholders that no longer exist are discarded and new placeholders are unfilled. If retroactive is false, existing items keep their current structure and values. Return the updated template, and if retroactive is true, return all items derived from the template.

	delete(template: Template, retroactive: bool) : (removedItems: set[Item])
	requires template belongs to the set of templates
	effects remove the template. If retroactive is true, apply this deletion to all items created from the template. Return all items removed.
