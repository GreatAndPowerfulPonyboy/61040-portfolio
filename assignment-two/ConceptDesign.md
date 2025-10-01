[Return to README](../README.md)
**Concept** Prompt[User,Date]

**Purpose** Enables learners to practice cued recall by creating prompts with cues and responses.

**Principle** A user creates a prompt with a cue and response. A user can then use the prompt in study sessions for recall practice. Each practice attempt is recorded with the time, user's answer, and outcome. The user can update the cue and/or response of the prompt when needed. The user can delete prompts when necessary. User can later view their performance history through analytics.

**State** a set of Prompts with
	a User owner
	a String cue
	a String response
	a Date createdAt
	a members set of Attempts
a set of Attempts with
	a Date attemptedAt
	a String userAnswer
	a Bool success
	
*****Actions****
	create(owner: User, cue: String, response: String, createdAt: Date) : (prompt:Prompt)
	effects: create new Prompt with given cue/response that is marked as being created at the current time and being owned by the user. Prompt is initialized with an empty attempts set.

	update(prompt: Prompt, newCue: String, newResponse: String, owner: User) : (newPrompt :Prompt)
	requires: Prompt exists and is owned by owner
	effects: Return a new prompt with the new cue and response values. It's creation date is initialized as the current date and its attempt set is empty.

	delete(prompt: Prompt, owner: User)
	requires: Prompt exists and is owned by owner
	effects: Prompt is removed from the set of Prompts

	attempt(prompt: Prompt, userAnswer: String, attemptDate: Date) :(attempt: Attempt)
	requires: Prompt exists and is owned by User
	effect: Records a new attempt into the set of attempt for the prompt. The attempt will have the user's answer, date of attempt, and whether they succeeded.

**Concept** TaggedItems[Item]

**Purpose**: Allow users to organize and classify items by giving them labels

**Principle**: A tag is created with a label. That label can then be attached to or detached from items to group them together. When a tag is no longer needed, it can be deleted. Later, a user can group items by a tag for the sake of retrieval.

**State**
	a set of Tags with
	a String label
	a members set of Items
****Actions****
	create(label: String): (tag: Tag)
	requires: None
	effect: Add a new tag to the set of tabs with the given label initialized with no resources

	attach(tag: Tag, item: Item)
	requires: Tag and item exist
	effect: associate tag and item

	detach(tag: Tag, item:Item)
	requires: Tag and item exist and item is associated with tag
	effect: Deassociate tag and item

	delete(tag: Tag)
	requires: Tag exists
	effect: Tag is removed from the set of tags and deassociated with its items

	

**Concept** SpacedRepetition[Item]

**Purpose** Allow users to automate review timing for items based on time until success

**Principle** Each resource is assigned a spaced repetition schedule with a next due date. When a user records a practice outcome, the schedule is updated. A user can view which resources are due, reschedule them, or cancel a schedule.

**State** a set of Schedules with
	an item Item
	a Date nextDue
	a Number interval

****Actions****
	schedule(item: Item, start: Date, interval: Number) : (schedule: schedule)
	requires: None
	effects: Create a new schedule for the Item with a nextDue of start and an interval of interval

	complete(schedule: Schedule, success: Bool, at: Date)
	requires: Schedule exists
	effects: If success is true, update the schedule's nextDue date to be nextDue plus interval. If success is false, update the schedule's nextDue date to be two days after at.

	reschedule(schedule: Schedule, newDate: Date) : (newSchedule: Schedule)
	requires: Schedule exists
	effects: return a new schedule for item with the same interval and a nextDue date of newDate

	cancel(schedule: Schedule)
	requires: schedule exists
	effects: Removes schedule from the set of schedules

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

## Synchronizations

##### Creation Syncs

sync createPromptDirect
  when Request.createPrompt (cue, response, tags)
       Prompt.create (owner, cue, response, createdAt): (prompt)
       TaggedItems.attach (tag, item: prompt) 
  then SpacedRepetition.schedule (item: prompt, start: createdAt, interval: 1)

sync createPromptFromTemplate
  when Request.createPromptFromTemplate (template, values, tags)
       Templating.produce (template, values): (item)
  then Prompt.create (owner, cue: item.cue, response: item.response, createdAt): (prompt)
       TaggedItems.attach (tag, item: prompt) 
       SpacedRepetition.schedule (item: prompt, start: createdAt, interval: 1)

#### Study Session/Updating syncs

sync attemptPrompt
  when Request.submitAnswer (prompt, userAnswer)
       Prompt.attempt (prompt, userAnswer, attemptDate): (attempt)
  then SpacedRepetition.complete (schedule: prompt.schedule, success: attempt.success, at: attemptDate)



sync updatePromptFromTemplate
  when Templating.update (template, newStructure, newPlaceholders, newName, retroactive: true)
       Templating.produce (template, originalValues): (newItem)
  then Prompt.update (prompt, newCue: newItem.cue, newResponse: newItem.response, owner): (newPrompt)


sync rescheduleUpdatedPrompt
  when Prompt.update (prompt, newCue, newResponse, owner): (newPrompt)
  then SpacedRepetition.cancel (schedule: prompt.schedule)
       SpacedRepetition.schedule (item: newPrompt, start: currentDate, interval: 1)


#### Deletion Syncs

sync deletePrompt
  when Prompt.delete (prompt, user)
  then SpacedRepetition.cancel (schedule: prompt.schedule)

sync detachTagFromPrompt
  when TaggedItems.delete (tag)
  then TaggedItems.detach (tag, item: prompt) 


