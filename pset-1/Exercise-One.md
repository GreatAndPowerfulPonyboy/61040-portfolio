### Questions
1. **Invariants**
The relationship between requests and purchases is that the sum of the total number of purchases for an item across all purchases and the remaining count of that item's request must equal the original total requested. The other invariant is that the counts of Items must be nonnegative. The more important invariant is the relationship between requests and purchases because it is that relationship that builds the fundamental concept of a gift registry. The purcahse action is most affected by this invariant and it preserves it by requiring that purchases have active requests with counts >= the purchase amount.
2. **Fixing an action**
The removeItem action can break this invariant by removing a request that has already had purchases made to it. This problem could be fixed by having removeItem not work if there are purchases in the registry for the item.
3. **Inferring Behavior**
Yes, a registry can be repeatedly opened and closed. One reason to allow this is to allow users to dynamically adjust their requested items so they don't feel they need to know exactly what they want immediately.
4. **Registry Deletion**
In practice, this wouldn't matter because any user that wants to delete a registry can get the same functionally by hiding the registry.
5. **Queries**
A registry owner will query who purchased what and a purchaser will query the remaining set of requests in the registry and their counts.
6. **Hiding purchases**
You could get this hidden functionality by removing the User from Purchase so that its state only has an Item and a count.
7. **Generic Types**
This is prefereable to representing items with specific parameters because it makes the concept more ready for change and easier to compose with other concepts. 

