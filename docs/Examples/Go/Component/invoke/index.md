# Custom WIT example

[This example](https://github.com/wasmCloud/go/tree/main/examples/component/invoke) shows how to
combine the wasmCloud Component SDK with your custom interfaces. You can find the custom interface
in `wit/world.wit`. It should look something like this:

```wit
interface invoker {
  call: func() -> string;
}
```

# Dependencies

Before starting, ensure that you have the following installed in addition to the Go toolchain:

- The [TinyGo toolchain][tinygo]
- [`wash`, the WAsmcloud SHell][wash] installed.
- [`wasm-tools`][wasm-tools] for Go bindings

[wasm-tools]: https://github.com/bytecodealliance/wasm-tools#installation

## Running the example

For this example, we will be building and deploying manually rather than using `wash dev` since we
will be demonstrating `wash call` which requires a stable identity to call. As you gain experience
with wasmCloud, you will likely want to use `wash dev` to automate your development process.

First, build the component:

```bash
wash build
```

Then you can start the host:

```bash
wash up -d
```

Next, deploy the component:

```bash
wash app deploy wadm.yaml
```

You should then be able to call the component:

```bash
wash call invoke_example-invoker example:invoker/invoker.call
Hello from the invoker!
```

To clean up, run:

```bash
wash app delete wadm.yaml
wash down
```

### Bonus: Calling when running with `wash dev`

When running with `wash dev`, it uses a generated ID for the component. If you have `jq` installed,
you can run the following command to call the component:

```bash
wash call "$(wash get inventory -o json | jq -r '.inventories[0].components[0].id')" example:invoker/invoker.call
Hello from the invoker!
```
