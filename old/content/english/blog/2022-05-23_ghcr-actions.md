---
title : "Deploying wasmCloud Actors from Github Packages"
image : "images/blogs/github-packages.png"
date: 2022-05-23T9:00:00-04:00
author: "Brooks Townsend"
author_profile: "https://linkedin.com/in/brooks-townsend"
description : "Simplifying the deployment experience for WebAssembly modules."
categories: ["webassembly", "wasmcloud", "developer experience"]
draft : false
---

With the general availability of GitHub Packages container registry, or GHCR for short, an easily accessible Docker registry made its way into the same platform many developers use for version control today. This was great news for containers and simplifying infrastructure, just like Actions greatly simplified workflows on GitHub.

But wait, there's more!

GitHub container registry also supports the Open Container Initiative (OCI) specification, which doesn't limit "containers" to just Docker containers, and it supports public anonymous downloads! This makes GHCR a perfect target for hosting OCI-compliant artifacts, like wasmCloud actors and capability providers. Today, we're going to walk through evolving use cases for getting more power out of this feature of GitHub and how it can simplify your wasmCloud development beyond running on your local machine.



Prerequisites
-------------

Today we'll be using a couple of tools for this tutorial:

*   A <u>[Rust](https://www.rust-lang.org/tools/install)</u> toolchain to build actors
    *   Make sure to add wasm32 as a target with `rustup target add wasm32-unknown-unknown`
*   <u>[wash](docs/installation/)</u>, the wasmCloud shell, at least `v0.11.0`

Pushing an actor to GitHub packages
-----------------------------------

To start, let's go ahead and generate a new wasmCloud actor project from the `hello` project template. This is our "hello world" actor.

```bash
wash new actor hello
```

Once the project is generated, `cd hello` into the project. There, you can run `cargo build --release` build your actor module. The last step before we can push it to GitHub is to <u>[sign](https://wasmcloud.dev/app-dev/std-caps/#sign-the-actor)</u> the actor with embedded claims. The following command will sign your actor and allow it to access the HTTPServer capability:

```bash
wash claims sign target/wasm32-unknown-unknown/release/hello.wasm --http_server --name Hello
```

By default this will place the actor under the same directory with a `_s` suffix, and you can verify this worked properly by running:

```bash
wash claims inspect target/wasm32-unknown-unknown/release/hello_s.wasm
```

Your output should be something like this, just with different `Account` and `Module` keys

```plain
                              Hello - Module
  Account       ABYFZKXEHQWJIMBKVAVG3Y5LGEBT3MQXRYVTQBF7RVHUIG62LUK3N5EQ
  Module        MAMP52XKSBHNDMWK4OR4BZVBDQNNZQ5FXDXUAX7KIT7KNOKK2N3CCLZ2
  Expires                                                          never
  Can Be Used                                                immediately
  Version                                                       None (0)
  Call Alias                                                   (Not set)
                               Capabilities
  HTTP Server
                                   Tags
  None
```



Now that we've built and signed your actor, let's push it to GitHub! To do this, you'll need a <u>[personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)</u> with the `write:packages` capability. Refer to the link for instructions on how to create this personal access token, and feel free to tweak the other parameters to your liking.

![](../../images/blogs/ghcr-actions/new-pat.png)

Once created, copy this token and store it in a safe place before moving back to your terminal.

![](../../images/blogs/ghcr-actions/pat-created.png)

Now, time to push! We'll use `wash` here along with some environment variables. `WASH_REG_USER` should be set to your GitHub username, and `WASH_REG_PASSWORD` should be set to your GitHub personal access token that you created before, starting with `ghp_`

```bash
export WASH_REG_USER=<your_github_username>
export WASH_REG_PASSWORD=<your_gitub_personal_access_token>
wash push ghcr.io/$WASH_REG_USER/hello:0.1.0 target/wasm32-unknown-unknown/release/hello_s.wasm
```
:::info
Previous guides used `wash reg push`, which is now deprecated and will be removed in a future version.
See [the wash command refactoring RFC](https://github.com/wasmCloud/wash/issues/538) for more information and to provide feedback
:::

You should see output like the following:

```plain
wash push ghcr.io/$WASH_REG_USER/hello:0.1.0 target/wasm32-unknown-unknown/release/hello_s.wasm

🚿 Successfully validated and pushed to ghcr.io/brooksmtownsend/hello:0.1.0
```

Now, you can navigate to your GitHub profile and access the `Packages` tab to see your `hello` actor.

![](../../images/blogs/ghcr-actions/package.png)

By default, our actor package is private so that it cannot be downloaded anonymously. Any wasmCloud host can be configured with a username and password for registry authentication, and in this case you can supply your GitHub username and personal access token to authenticate and download your actor. However, this step can be missed easily, so let's make this actor package public so you can start it anywhere. Click on your package, then on the "[⚙️](https://emojipedia.org/gear/) Package Settings" sidebar. From there, scroll to the bottom and "Change visibility" to public.

![](../../images/blogs/ghcr-actions/change-visibility.png)

Now you can download and run that actor on any wasmCloud host, which can be on Mac, Linux, Windows, or even in a browser tab! You can test connectivity at any time by running:

```bash
wash claims inspect ghcr.io/<your_github_username>/hello:0.1.0
```

Continuous integration with a GitHub repository
-----------------------------------------------

Now that we have a Package set up for our actor, the next step is to connect it to a repository. Once we do that we can take advantage of the built-in Actions that are provided with an actor project to automatically build, test, and release actors.



First step is to create a GitHub repository. For simplicity, let's call it `hello` to match the actor name.

![](../../images/blogs/ghcr-actions/create-repo.png)

Once that's created, we need to associate our local actor project with the GitHub repository. `cd hello` into your actor project if you haven't already, and then:

```bash
git add .
git commit -m "initial commit"
git branch -M main
# If you named your repository something else, simply replace the URL below
git remote add origin https://github.com/<your_github_name>/hello.git
git push -u origin main
```

For every commit after this one, and every pull request into `main` , your actor will be automatically built, checked for formatting, lints, and tested once you add unit tests and uncomment the `cargo test` step in `.github/workflows/build.yml`.



For the `.github/workflows/release.yml` action, we need to configure three repository secrets to properly sign and release your actor. The good news is, we already have all of these secrets, we just need to plop them in GitHub!

![](../../images/blogs/ghcr-actions/repo-secrets.png)

Under your repository settings, head to the `Secrets` dropdown and click `Actions` . Here we can configure the following secrets for use in this repository.

| <div style="width:175px">**name**</div> | **value** |
| ---| --- |
| WASH\_ISSUER\_KEY | Can be found under `$HOME/.wash/keys` with the form of `<your_username>_account.nk`. Copy the contents of this file, a 56 character <u>[NKey](https://docs.nats.io/running-a-nats-service/configuration/securing_nats/auth_intro/nkey_auth)</u> starting with `SA`, into the value section. |
| WASH\_SUBJECT\_KEY | Can be found under `$HOME/.wash/keys/hello_module.nk`. Copy the contents of this file, a 56 character <u>[NKey](https://docs.nats.io/running-a-nats-service/configuration/securing_nats/auth_intro/nkey_auth)</u> starting with `SM`, into the value section. |
| WASMCLOUD\_PAT | Your personal access token that you previously used for `WASH_REG_PASSWORD` |

![](../../images/blogs/ghcr-actions/required-secrets.png)

Once these three secrets are configured, let's cut our first release of the `hello` actor. Head back to your command line and create a tag for `v0.1.0` and push it to `main`

```bash
git tag -a v0.1.0 -m "initial release for hello actor"
git push -u origin v0.1.0
```

This will automatically kick off the release action, which includes building and testing the actor just like the build action, and after a few minutes you'll see a new GitHub release created with the OCI URL for the actor and claims information, as well as the `hello` package associated with this repo.

![](../../images/blogs/ghcr-actions/release.png)

Wrap up
-------

Today we walked through the setup process to configure a GitHub repository to automatically build, test, and release wasmCloud actors to GitHub Packages. You can continue to add to these base workflow templates to include your own custom checks as well.



What's next?
------------

Now that your `hello` actor is published to a public OCI registry, you can follow our <u>[run actor](https://wasmcloud.dev/app-dev/create-actor/run/)</u> tutorial with the OCI reference instead of uploading a local file. If you're new to wasmCloud, check out our documentation for helpful information about <u>[actors](https://wasmcloud.dev/reference/host-runtime/actors/)</u>, our <u>[security model](https://wasmcloud.dev/reference/host-runtime/security/)</u>, and more. Feedback on this process is welcome and encouraged on our <u>[project-templates](https://github.com/wasmcloud/project-templates)</u> repo; and to stay involved you can join our <u>[slack](https://slack.wasmcloud.com/)</u>.
