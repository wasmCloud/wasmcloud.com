# Go HTTP Server

[This example](https://github.com/wasmCloud/go/tree/main/examples/component/http-server) is a
WebAssembly Component compiled using [TinyGo][tinygo], which:

- Implements a [`wasi:http`][wasi-http]-compliant HTTP handler
- Uses the [`httpserver` provider][httpserver-provider] to serve requests
- Can be declaratively provisioned with [`wadm`][wadm]

[wasi-http]: https://github.com/WebAssembly/wasi-http
[httpserver-provider]: https://github.com/wasmCloud/wasmCloud/tree/main/crates/provider-http-server
[wadm]: https://github.com/wasmCloud/wadm
[tinygo]: https://tinygo.org/getting-started/install/
[wash]:  https://wasmcloud.com/docs/ecosystem/wash/
[wasm-tools]: https://github.com/bytecodealliance/wasm-tools#installation

# Dependencies

Before starting, ensure that you have the following installed in addition to the Go toolchain:

- The [TinyGo toolchain][tinygo]
- [`wash`, the WAsmcloud SHell][wash] installed.
- [`wasm-tools`][wasm-tools] for Go bindings

## Quickstart

To get started developing this repository quickly, clone the repo and run `wash dev`:

```console
wash dev
```

`wash dev` does many things for you:

- Starts the [wasmCloud host][wasmcloud-host] that can run your WebAssembly component
- Builds this project
- Builds a declarative WADM manifest consisting of:
  - Your locally built component
  - A [HTTP server provider][httpserver-provider] which will receive requests from the outside world
    (on port 8000 by default)
  - Necessary links between providers and your component so your component can handle web traffic
- Deploys the built manifest (i.e all dependencies to run this application) locally
- Watches your code for changes and re-deploys when necessary.

[wasmcloud-host]: https://wasmcloud.com/docs/concepts/hosts

## Send a request to the running component

Once `wash dev` is serving your component, to send a request to the running component (via the HTTP
server provider)

### Available Endpoints

#### GET /

Returns a list of available endpoints and their descriptions.

```console
curl http://localhost:8000/
  /error - return a 500 error
  /form - echo the fields of a POST request
  /headers - echo your user agent back as a server side header
  /post - echo the body of a POST request
```

#### GET /error

Returns a 500 Internal Server Error.

```console
curl -v http://localhost:8000/error
* Host localhost:8000 was resolved.
* IPv6: ::1
* IPv4: 127.0.0.1
*   Trying [::1]:8000...
* connect to ::1 port 8000 from ::1 port 51390 failed: Connection refused
*   Trying 127.0.0.1:8000...
* Connected to localhost (127.0.0.1) port 8000
> GET /error HTTP/1.1
> Host: localhost:8000
> User-Agent: curl/8.7.1
> Accept: */*
> 
* Request completely sent off
< HTTP/1.1 500 Internal Server Error
< content-type: text/plain; charset=utf-8
< x-content-type-options: nosniff
< vary: origin, access-control-request-method, access-control-request-headers
< access-control-allow-origin: *
< access-control-expose-headers: *
< connection: close
< transfer-encoding: chunked
< date: Thu, 19 Dec 2024 23:52:34 GMT
< 
Something went wrong
* Closing connection
```

#### GET /headers

Returns your User-Agent in the response headers.

```console
curl -v http://localhost:8000/headers
* Host localhost:8000 was resolved.
* IPv6: ::1
* IPv4: 127.0.0.1
*   Trying [::1]:8000...
* connect to ::1 port 8000 from ::1 port 51499 failed: Connection refused
*   Trying 127.0.0.1:8000...
* Connected to localhost (127.0.0.1) port 8000
> GET /headers HTTP/1.1
> Host: localhost:8000
> User-Agent: curl/8.7.1
> Accept: */*
> 
* Request completely sent off
< HTTP/1.1 200 OK
< x-your-user-agent: curl/8.7.1
< vary: origin, access-control-request-method, access-control-request-headers
< access-control-allow-origin: *
< access-control-expose-headers: *
< connection: close
< transfer-encoding: chunked
< date: Thu, 19 Dec 2024 23:53:49 GMT
< 
* Closing connection
Check headers!
```

#### POST /form

Echoes back form data from a POST request.

```console
curl -X POST -d "field1=value1&field2=value2" http://localhost:8000/form
field2: value2
field1: value1
```

#### POST /post

Echoes back the entire body of a POST request.

```console
curl -X POST -d "Hello World" http://localhost:8000/post
Hello World
```

## Adding Capabilities

To learn how to extend this example with additional capabilities, see the [Adding
Capabilities](https://wasmcloud.com/docs/tour/adding-capabilities?lang=rust) section of the
wasmCloud documentation.

# Issues/ FAQ

<summary>
<description>

## `curl` produces a "failed to invoke" error

</description>

If `curl`ing produces

```
➜ curl localhost:8000
failed to invoke `wrpc:http/incoming-handler.handle`: failed to invoke `wrpc:http/incoming-handler@0.1.0.handle`: failed to shutdown synchronous parameter channel: not connected%
```

You *may* need to just wait a little bit -- the HTTP server takes a second or two to start up.

If the issue *persists*, you *may* have a lingering HTTP server provider running on your system. You
can use `pgrep` to find it:

```console
❯ pgrep -la ghcr_io
4007604 /tmp/wasmcloudcache/NBCBQOZPJXTJEZDV2VNY32KGEMTLFVP2XJRZJ5FWEJJOXESJXXR2RO46/ghcr_io_wasmcloud_http_server_0_23_1
```

</summary>
