<h1><a name="messaging_handler">World messaging-handler</a></h1>
<ul>
<li>Imports:
<ul>
<li>interface <a href="#wasmcloud:messaging_types_0.2.0"><code>wasmcloud:messaging/types@0.2.0</code></a></li>
</ul>
</li>
<li>Exports:
<ul>
<li>interface <a href="#wasmcloud:messaging_handler_0.2.0"><code>wasmcloud:messaging/handler@0.2.0</code></a></li>
</ul>
</li>
</ul>
<h2><a name="wasmcloud:messaging_types_0.2.0"></a>Import interface wasmcloud:messaging/types@0.2.0</h2>
<p>Types common to message broker interactions</p>
<hr />
<h3>Types</h3>
<h4><a name="broker_message"></a><code>record broker-message</code></h4>
<p>A message sent to or received from a broker</p>
<h5>Record Fields</h5>
<ul>
<li><a name="broker_message.subject"></a><code>subject</code>: <code>string</code></li>
<li><a name="broker_message.body"></a><code>body</code>: list&lt;<code>u8</code>&gt;</li>
<li><a name="broker_message.reply_to"></a><code>reply-to</code>: option&lt;<code>string</code>&gt;</li>
</ul>
<h2><a name="wasmcloud:messaging_handler_0.2.0"></a>Export interface wasmcloud:messaging/handler@0.2.0</h2>
<hr />
<h3>Types</h3>
<h4><a name="broker_message"></a><code>type broker-message</code></h4>
<p><a href="#broker_message"><a href="#broker_message"><code>broker-message</code></a></a></p>
<p>
----
<h3>Functions</h3>
<h4><a name="handle_message"></a><code>handle-message: func</code></h4>
<p>Callback handled to invoke a function when a message is received from a subscription</p>
<h5>Params</h5>
<ul>
<li><a name="handle_message.msg"></a><code>msg</code>: <a href="#broker_message"><a href="#broker_message"><code>broker-message</code></a></a></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a name="handle_message.0"></a> result&lt;_, <code>string</code>&gt;</li>
</ul>
