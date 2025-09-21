#### [Return to README](../README.md/#problem-set-two-composing-concepts)
**1. Contexts**

Context codifies the idea of a generic namespace or scope. They define a domain in which we enforce the uniqueness of a set of strings within, while allowing that uniqueness to be violated across different contexts/scopes. In the URL shortening app, a context could be a service-wide databse or a per user or even per target website database.

**2. Storing used strings**

NonceGeneration has to store a set of used strings in order to maintain the invariant that it will generate a string that hasn't been returned before for that context. It has to store multiple sets of strings instead of just some system set because we allow inter-concept violation of uniqueness, but not intra-concept. 

AF(context, count) -> A string representation of the integer specified by count as part of the set of unique strings mapped to by context.

**3. Words as nonces**

One advantage of this scheme is that the ease of remembering different nonces is such tha you could just tell someone the link instead of being required to copy it over and send it to them, increasing ease of use in classroom settings, for example. One disadvantage for the user is that they may end up with a common dictionary word link that creates a misunderstanding of the redirection. For example, if a user were to generate a shortening for their personal blog, they probably wouldn't want to have miscreant as a shortening. 
Noncegeneration could have its state changed to store a set of available dictionary word strings, and the generate action could pull an available string from that set for the given context.