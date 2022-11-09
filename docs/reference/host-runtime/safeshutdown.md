---
title: "Safe Shutdown"
date: 2021-08-18T11:02:05+06:00
weight: 12
draft: false
---

In most cases, initiating a safe shutdown of the wasmCloud host runtime is quick and easy. 

### Stopping the Background Daemon
If you started the wasmCloud host runtime as a background process/daemon, then you can simply use the `wasmcloud_host` binary to terminate the process by executing `wasmcloud_host stop`.

### Exiting a Console
If you start the wasmCloud host runtime as a console, either through the use of the `iex` application or by running `wasmcloud_host start_iex`, then you are in an interactive mode application that typically only supports termination through `ctrl-c`.

Before you use `ctrl-c` to exit the application, you can invoke an Elixir function in the `Host` module to attempt to purge all running entities, performing a graceful shutdown (which sends the "quit" message to all running capability providers, etc).

```elixir
HostCore.Host.purge()
```
Once you've run this command, you can safely use `ctrl-c` to abort your interactive console session.

---
#### ℹ️ Debugging Failed Host Shutdowns
The following is a list of potential techniques to use when troubleshooting host shutdown failures or, more commonly, provider shutdown failures from _unsafely_ or unexpectedly terminated hosts.

##### Checking for Orphan Providers
While the wasmCloud host will make every effort to terminate capability providers when the host is being shut down, sometimes this won't work. This could be a result of the way the provider is written, the operating system being used, or even seemingly random circumstances that contribute to "serendipitous" timing that blocks the termination of the child process.

To ensure that no orphan capability providers are still running, use whatever tool you prefer to obtain a process list and look for the binaries associated with the capability providers you had running. For example, if you were running the HTTP server capability provider, you'd look for the `httpserver` binary. Depending on the tool you're using, you can also easily look for all processes started from the `$TEMP/wasmcloudcache` directory--the root directory of the disk cache location from which all capability providers are launched.

For example, you could use `ps -av` on linux which will obtain all processes and then in the `COMMAND` column give you the full path. You could then use `grep` to filter the output to only things that contain the `/wasmcloudcache/` path.

###### Orphan Provider Symptoms
Most of the time you shouldn't have to worry about orphaned capability providers remaining active after the host dies. _However_, if this does happen, then there are some very obvious symptoms.
* Invalid Invocations - If you start a second host, leaving a provider running that was spawned by the first host, then this new second host could potentially have a different signing key (assuming the first and second use an _ad hoc_ key). This scenario will manifest itself by having inbound requests from the old provider fail the invocation anti-forgery checks.
* Duplicate Attempts to Acquire Resources - Whether this symptom occurs is entirely dependent on the provider and the resources it uses. The most obvious one you might see is if the HTTP server provider was orphaned and a new one started with the same link definition, you'll see an error in the logs about an `address already in use`.

These symptoms can often both occur at the same time. For example, using the HTTP server provider will show both of these errors in the output logs upon starting the new provider with existing link definitions and then invoking an HTTP endpoint.