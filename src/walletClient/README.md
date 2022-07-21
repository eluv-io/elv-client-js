# Eluvio Wallet Client

This is a standalone client for using Eluvio Media Wallet functionality

For information about the embedded wallet app frame client, see [here](https://eluv-io.github.io/elv-media-wallet/ElvWalletFrameClient.html)

## Initializing the Client

Import the client using the following path:

```javascript
import {ElvWalletClient} from "@eluvio/elv-client-js/src/walletClient/index";
```

Initializing the client is as simple as calling the static Initialize method with the network (main or demo) and the mode (production or staging) the client should operate upon, as well as (optionally) the marketplace to associate the client with.

```javascript
await ElvWalletClient.Initialize({
  network: "main | demo",
  mode: "production | staging",
  marketplaceParams: {
    tenantSlug,
    marketplaceSlug
  }
})
```

## Referencing Marketplaces

Many methods, including the Initialize method, take a parameter called `marketplaceParams`. This parameter should be specified in one of the following formats:

Specify the tenant slug and marketplace slug corresponding to your marketplace.
```javascript
{
  tenantSlug: "<tenant-slug>", 
  marketplaceSlug: "<marketplace-slug>"
}
```

Specify the object ID of the marketplace
```javascript
{ marketplaceId: "iq__abc123" }
```

Specify a version hash of the marketplace
```javascript
{ marketplaceHash: "hq__abc123" }
```

## Handling Login

The wallet client make it simple to log in with the Eluvio Media Wallet. However, if you are also using the frame client to embed the wallet application, extra care must be taken to ensure the login flow is handled correctly and the wallet client and frame have parity in their authorization states.

<div id="wallet-client" />

### Wallet Client

##### Redirect Flow
```javascript
walletClient.LogIn({
  method: "redirect",
  callbackUrl: <https://your-domain.com/callback>
});
```

Upon login, the browser will return to the callbackUrl with the authorization token as a url parameter (`elvToken`). **Initializing the client will automatically pull the token out of the URL parameters and log in.** 

If you don't want to initialize the client in the callback URL, you can save this token and later set it in the client using the `Authenticate` method.

```javascript
const searchParams = new URLSearchParams(window.location.search);
const clientAuthToken = searchParams.get("elvToken");

...

walletClient.Authorize({token: clientAuthToken});

```

##### Popup Flow
```javascript
try {
  await walletClient.LogIn({
    method: "popup"
  })
} catch(error) {
  // User closed popup
}
```

##### Additional Options

The `clear` parameter in the LogIn method will ensure that the user does the full log in flow, even if they are already logged in to the Eluvio Media Wallet application. This is important to specify if the user has logged out from your application, as they will otherwise still be logged in to the Media Wallet and the login flow will simply authorize them as the same user.

The `provider` parameter will automatically proceed to log in with the specified provider instead of presenting the usual login screen and waiting for the user to choose. For example, you can specify that the login flow should automatically prompt for Metamask login or proceed to the OAuth login flow. For the OAuth flow, the `mode` parameter can be used to proceed to the `login` flow or the `create` account flow.

##### Saving Authorization

By default, the client will save the authorization token in localstorage, if available. If you prefer to handle storing the authorization token differently, you can specify that the client should not save the token when initializing the client:

```javascript
const walletClient = ElvWalletClient.Initialize({
  ...,
  storeAuthToken: false
})
```

The authorization token can be retrieved using `walletClient.ClientAuthToken()`, which can then be used later in the `Authenticate` method.


### Frame Client

If you only want to embed the Eluvio Media Wallet application without using the Wallet Client and you don't want to implement a custom login screen, no special effort is needed. The wallet app UI will handle login natively.

You can use event listeners with the frame client to detect when the user logs in or out:

```javascript
frameClient.AddEventListener(frameClient.EVENTS.LOG_IN, ({address}) => { ... });

frameClient.AddEventListener(frameClient.EVENTS.LOG_OUT, () => { ... });
```


### Custom Login UI For Embedded Wallet App / Using Both Wallet Client and Frame Client

If you want to implement a custom login screen for the embedded wallet application, or if you want to use both the wallet and frame clients in the same application, some care must be taken to ensure the login flow is handled correctly and the wallet client and frame have parity in their authorization states.

First, **login should be handled by the Wallet Client only**. The wallet client does not have to deal with the limitations of iframes, and the wallet client is allowed access to the user's authorization token, which can be passed to the frame client to authorize the embedded application. 

Authorization can be passed to the embedded frame, but **cannot be retrieved** from it. Because of this, logging in via the embedded application would mean the user is logged in in the frame, but the wallet client in the containing application has no access to that user's authorization.

Here's how to handle this case:

##### Perform Login Using the Wallet Client

See the [Wallet Client](#wallet-client) login section for details about how to handle the login flow with the wallet client.

##### Capture Login from the Frame

When initializing the frame client, specify the `captureLogin` option. This will cause login prompts (e.g. user clicks log in, user tries to perform/access something that requires login, etc.) to emit an event instead of presenting the login form in the frame. 

```javascript
const frameClient = await ElvWalletFrameClient.InitializeFrame({
  ...,
  captureLogin: true
})
```

You can then listen for that event to present your own login screen, or simply trigger the login flow with the Wallet Client.

```javascript
frameClient.AddEventListener(
  frameClient.EVENTS.LOG_IN_REQUESTED,
  () => {
    // Show your login screen or log in with wallet client
    // ShowLogin()
    // walletClient.LogIn({...});
  }
)
```

##### Pass Authorization Token to Frame Client

When the login flow has completed with the wallet client, pass the authorization token to the embedded application:

```javascript
if(walletClient.ClientAuthToken()) {
  await frameClient.LogIn({clientAuthToken: walletClient.ClientAuthToken()})
}
```

##### Handle Log Out in Both Clients

After the user is logged in with the frame client, you can present an option to log out. Be sure this logs out both the wallet client and the frame client:

```javascript
function LogOutFromMyApp() {
  walletClient.LogOut();
  frameClient.LogOut();
}
```

Additionally, the user may log out from the embedded application. Use an event listener in the frame client to handle this and log out from the wallet client:

```javascript
frameClient.AddEventListener(
  frameClient.EVENTS.LOG_OUT,
  () => LogOutFromMyApp()
);
```

