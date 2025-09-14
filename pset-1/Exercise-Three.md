#### [Return to README](../README.md#problem-set-one-reading-and-writing-concepts)
**Concept** PersonalAccessToken

**Purpose** Limit resource usage to verified tokens

**Principle** a User can generate a new token with a specified Expiration and Scope,

They can use their username and the token to authenticate usage of Resources that match the Scope of the token for as long as the token has not expired


**State**
a set of Users with

a String Username

a set of String tokens


a set of Tokens with

a Number expiration

a set of Strings Scope


a set of Resources with

a Scope

**Actions**

GenerateToken(user: User, scope: Scope, expiration: Number): (token:Token)

**requires** user in the set of Users

**effects** Create a new token in the set of Tokens with given expiration and scope. Grant ownership of the token to user.

Authenticate(resource: Resource, username: String, token: Token): (user:User)

**requires** User with the given username and token exists in the set of Users. Token is not expired. The scope of token is a superset of the scope of Resource.

**effects** Return the user


This differs from PasswordAuthentication because instead of allowing someone with the correct username and password the full scope of a user's permissions, each token grants access to a predetermined scope of a resource in order to increase security. i.e instead of taking the full scope of your read and write accesses, a hacker would only have your ability to write to a specific repository. In the [Github Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#about-personal-access-tokens) I would also highlight that someone with your personal access token only has the capabilities granted by the token, and not your full read/write access permissions to more clearly explain the benefit.



