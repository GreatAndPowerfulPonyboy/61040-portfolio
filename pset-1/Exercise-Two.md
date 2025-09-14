#### [Return to README](../README.md#problem-set-one-reading-and-writing-concepts)
**Concept** PasswordAuthentication

**Purpose** limit access to known users

**principle** after a user registers with a username and password,

they can authenticate with that same username and password

and be treated each time as the same user

**state**
a set of Users with

a String username

a String password

**actions**
register(username: String, password:String): (user:User)

**requires** A User with username does not exist in the set of Users

**effects**  Create and return a new user with username and password and add to the set of Users

authenticate(username:String, password:String): (user:User)

**requires** User with specific username and password exist in the set of users

**effects** Return said user

3. The essential invariant that must hold within the state is that each user has exactly one username and password. This is preserved by the register action requiring that a user cannot be created with the same username as another user. 

4. 

**Concept** PasswordAuthentication

**Purpose** limit access to known users

**principle** after a user registers with an email,

a token is sent that allows them to confirm a username and password, 

and they can authenticate with that same username and password

and be treated each time as the same user

**state**
a set of Users with

a String email

a Token token

a String username

a String password

**actions**
register(email:String): (token:Token)

**requires** A User with email does not exist in the set of Users

**effects**  Create and return a new secret token to be emailed to the user

confirm(username: String, password: String, token: Token): (user:User)

**requires** username and token are not associated with another user in users

**effects** create and return a new user in Users with the specified username and password

authenticate(username:String, password:String): (user:User)

**requires** User with specific username and password exist in the set of users

**effects** Return said user



