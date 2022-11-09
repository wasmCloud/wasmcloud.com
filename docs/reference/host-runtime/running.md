---
title: "Running the Host"
date: 2018-12-29T11:02:05+06:00
weight: 11
draft: false
---

The wasmCloud host runtime is an [Elixir mix release](https://hexdocs.pm/mix/Mix.Tasks.Release.html) that includes various scripts for running and managing an application. By running `bin/wasmcloud_host`, you'll see a variety of commands and options:
```plain
./bin/wasmcloud_host
Usage: wasmcloud_host COMMAND [ARGS]

The known commands are:

    start          Starts the system
    start_iex      Starts the system with IEx attached
    daemon         Starts the system as a daemon
    daemon_iex     Starts the system as a daemon with IEx attached
    eval "EXPR"    Executes the given expression on a new, non-booted system
    rpc "EXPR"     Executes the given expression remotely on the running system
    remote         Connects to the running system via a remote shell
    restart        Restarts the running system via a remote command
    stop           Stops the running system via a remote command
    pid            Prints the operating system PID of the running system via a remote command
    version        Prints the release name and version to be booted
```
There are a variety of commands and options to get used to here, we generally only focus on the commands that manage starting, stopping, and debugging a wasmCloud application.

- To start the host running in the current terminal, which is recommended to easily view logs, you can use `start`

  ```bash
  bin/wasmcloud_host start
  ```

- Alternately, you can start it in the background as a daemon with `daemon`

  ```bash
  bin/wasmcloud_host daemon
  ```

  and stop it with
  ```bash
  bin/wasmcloud_host stop
  ```
  or restart it with
  ```bash
  bin/wasmcloud_host restart
  ```
  
  If you choose this option, host logs will be located under `tmp/log` and can be viewed with:

  ```bash
  tail tmp/log/erlang.log.1
  ```

- If you're already familiar with Elixir and **iex**, Elixir's interactive shell, and want to dive into the host's internals, execute Elixir statements, and set breakpoints, start the host including an interactive console with:

  ```bash
  bin/wasmcloud_host start_iex
  ```