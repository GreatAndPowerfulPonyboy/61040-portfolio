## Part One: Designing Concepts
#### [Return to README](../README.md/#problem-set-two-composing-concepts)
**concept** UserSession

**purpose** authenticate and track user identity

**principle** after a user logs in, subsequent actions can be attributed to that user

**state**

a set of Sessions with
a user String
a sessionId String

**actions**

login (user: String): (sessionId: String)

**effect** creates new session for user and returns session ID

getUser (sessionId: String): (user: String)
**requires** session exists for sessionId

**effect** returns the user associated with the session

**Concept** ResourceAnalytics

**Purpose** Lets users get desired analytics from the resources they own

**Principle** After the creation of a resource,
the resource can track the access count of said resource. These analytics last as long as the resource does, and can only be queried by users with ownership over the resource.

**State**

A set of Users with
    a set of Resources

A set of Resources with
    an Integer AccessCount

**actions**

createResource(user : User, resource: Resource): (user: User)

**requires** None

**effect** create a mapping between user and resource, initialize resource's accesscount to 0 and create that mapping in the set of resources

incrementCount(resource: Resource): (count: Integer)

**requires** resource is associated with a user in Users

**effect** Returns the incremented AccessCount of the resource

queryCount(user: User, resource: Resource) : (AccessCount: Integer)

**requires** user is associated with resource

**effect** returns the AccessCount of the resource

## Part Two: Defining Syncs
#### [Return to README](../README.md/#problem-set-two-composing-concepts)


**sync** createAnalytics

**when** UrlShortening.register(): (shortUrl)

**then** ResourceAnalytics.create(resource: shortUrl, user: sessionId)

**sync** trackAccess

**when** UrlShortening.lookup(shortUrl) : (targetUrl)

**then** ResourceAnalytics.incrementCount(resource: shortUrl)

**sync** viewAnalytics

**when** Request.getAnalytics(shortUrl, sessionId), UserSession.getUser(sessionId): (user)

**then** ResourceAnalytics.queryCount(user: user, resource: shortUrl)

## Part Three: Modularity
#### [Return to README](../README.md/#problem-set-two-composing-concepts)


1. Allowing users to create their own short URLs

Modify Request.shortenUrl to include an optional customSuffix parameter. Then, update the register sync to use the custom suffix if provided or just generate a nonce.

2. Using the "word as nonce" strategy

Modify NonceGeneration to use a word dictionary.

3. Including target Url in analytics

Modify ResourceAnalytics' state to add a targetUrl field and modify its creation action to store that targetUrl. Add a new action to group stats by targetUrl. 

4. Generate short URLs that are not easily guessed

Modify NonceGeneration to use some random hash of strings.

5. Supporting reporting of analytics to creators who have not registered as user 

Undesireable modification. Analytics ought to remain private to the creator of the Url for the sake of privacy and security.