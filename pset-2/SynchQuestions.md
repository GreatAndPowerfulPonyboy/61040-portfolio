**1. Partial Matching**
In the first sync, generate doesn't need targeturl as part of a set of bindings in order to function, so it can be omitted. UrlShortening.register, however, does require both shortURLBase and targetUrl, so it needs to be clearly indicated that those variables are within the set of bindings of the scope.

**2. Omitting names**
This convention ins't used in every case because tehre may be moments where deobfuscation could be useful. One such case could be when an argument whose name is the same as its variable name would then be bound by another clause.

**3. Inclusion of request**
The Request class specifies a set of methods that are called by some user/client. In the case of setExpiry, the user doesn't send a register request, what happens is that they send a shortenUrl request that then leads into a generate and then a register sync. They do not themselves call setExpiry.

**4. Fixed domain**
In the generate sync, make it so that Request.shortenUrl doesn't take an argument in at all, or that context is always bound to bit.ly instead of the sent shortUrlBase.

**5.Adding a sync**

**sync** removeResource

**when** 
   system.expireResource() : (resource: Resource)

**then**

    UrlShortening.delete(shortUrl: Resource)
