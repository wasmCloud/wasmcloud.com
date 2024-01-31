<h1><a name="guest">World guest</a></h1>
<ul>
<li>Exports:
<ul>
<li>interface <a href="#wasmcloud:bus_guest"><code>wasmcloud:bus/guest</code></a></li>
</ul>
</li>
</ul>
<h2><a name="wasmcloud:bus_guest">Export interface wasmcloud:bus/guest</a></h2>
<hr />
<h3>Functions</h3>
<h4><a name="call"><code>call: func</code></a></h4>
<p>call an operation of form <code>namespace:package/interface.operation</code>, e.g. <code>wasmcloud:bus/guest.call</code></p>
<h5>Params</h5>
<ul>
<li><a name="call.operation"><code>operation</code></a>: <code>string</code></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a name="call.0"></a> result&lt;_, <code>string</code>&gt;</li>
</ul>
