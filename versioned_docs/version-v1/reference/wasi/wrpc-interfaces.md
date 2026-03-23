<h1><a id="wrpc_interfaces"></a>World wrpc-interfaces</h1>
<ul>
<li>Imports:
<ul>
<li>interface <a href="#wasmcloud_messaging_types_0_2_0"><code>wasmcloud:messaging/types@0.2.0</code></a></li>
<li>interface <a href="#wasmcloud_messaging_consumer_0_2_0"><code>wasmcloud:messaging/consumer@0.2.0</code></a></li>
<li>interface <a href="#wrpc_keyvalue_store_0_2_0_draft"><code>wrpc:keyvalue/store@0.2.0-draft</code></a></li>
<li>interface <a href="#wrpc_keyvalue_atomics_0_2_0_draft"><code>wrpc:keyvalue/atomics@0.2.0-draft</code></a></li>
<li>interface <a href="#wrpc_keyvalue_batch_0_2_0_draft"><code>wrpc:keyvalue/batch@0.2.0-draft</code></a></li>
<li>interface <a href="#wasi_io_error_0_2_0"><code>wasi:io/error@0.2.0</code></a></li>
<li>interface <a href="#wasi_io_poll_0_2_0"><code>wasi:io/poll@0.2.0</code></a></li>
<li>interface <a href="#wasi_io_streams_0_2_0"><code>wasi:io/streams@0.2.0</code></a></li>
<li>interface <a href="#wasi_blobstore_types_0_2_0_draft"><code>wasi:blobstore/types@0.2.0-draft</code></a></li>
<li>interface <a href="#wrpc_blobstore_types_0_1_0"><code>wrpc:blobstore/types@0.1.0</code></a></li>
<li>interface <a href="#wrpc_blobstore_blobstore_0_1_0"><code>wrpc:blobstore/blobstore@0.1.0</code></a></li>
</ul>
</li>
<li>Exports:
<ul>
<li>interface <a href="#wasmcloud_messaging_handler_0_2_0"><code>wasmcloud:messaging/handler@0.2.0</code></a></li>
</ul>
</li>
</ul>
<h2><a id="wasmcloud_messaging_types_0_2_0"></a>Import interface wasmcloud:messaging/types@0.2.0</h2>
<p>Types common to message broker interactions</p>
<hr />
<h3>Types</h3>
<h4><a id="broker_message"></a><code>record broker-message</code></h4>
<p>A message sent to or received from a broker</p>
<h5>Record Fields</h5>
<ul>
<li><a id="broker_message.subject"></a><code>subject</code>: <code>string</code></li>
<li><a id="broker_message.body"></a><code>body</code>: list&lt;<code>u8</code>&gt;</li>
<li><a id="broker_message.reply_to"></a><code>reply-to</code>: option&lt;<code>string</code>&gt;</li>
</ul>
<h2><a id="wasmcloud_messaging_consumer_0_2_0"></a>Import interface wasmcloud:messaging/consumer@0.2.0</h2>
<hr />
<h3>Types</h3>
<h4><a id="broker_message"></a><code>type broker-message</code></h4>
<p><a href="#broker_message"><a href="#broker_message"><code>broker-message</code></a></a></p>
<p>
----
<h3>Functions</h3>
<h4><a id="request"></a><code>request: func</code></h4>
<p>Perform a request operation on a subject</p>
<h5>Params</h5>
<ul>
<li><a id="request.subject"></a><code>subject</code>: <code>string</code></li>
<li><a id="request.body"></a><code>body</code>: list&lt;<code>u8</code>&gt;</li>
<li><a id="request.timeout_ms"></a><code>timeout-ms</code>: <code>u32</code></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="request.0"></a> result&lt;<a href="#broker_message"><a href="#broker_message"><code>broker-message</code></a></a>, <code>string</code>&gt;</li>
</ul>
<h4><a id="publish"></a><code>publish: func</code></h4>
<p>Publish a message to a subject without awaiting a response</p>
<h5>Params</h5>
<ul>
<li><a id="publish.msg"></a><code>msg</code>: <a href="#broker_message"><a href="#broker_message"><code>broker-message</code></a></a></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="publish.0"></a> result&lt;_, <code>string</code>&gt;</li>
</ul>
<h2><a id="wrpc_keyvalue_store_0_2_0_draft"></a>Import interface wrpc:keyvalue/store@0.2.0-draft</h2>
<p>A keyvalue interface that provides eventually consistent key-value operations.</p>
<p>Each of these operations acts on a single key-value pair.</p>
<p>The value in the key-value pair is defined as a <code>u8</code> byte array and the intention is that it is
the common denominator for all data types defined by different key-value stores to handle data,
ensuring compatibility between different key-value stores. Note: the clients will be expecting
serialization/deserialization overhead to be handled by the key-value store. The value could be
a serialized object from JSON, HTML or vendor-specific data types like AWS S3 objects.</p>
<p>Data consistency in a key value store refers to the guarantee that once a write operation
completes, all subsequent read operations will return the value that was written.</p>
<p>Any implementation of this interface must have enough consistency to guarantee &quot;reading your
writes.&quot; In particular, this means that the client should never get a value that is older than
the one it wrote, but it MAY get a newer value if one was written around the same time. These
guarantees only apply to the same client (which will likely be provided by the host or an
external capability of some kind). In this context a &quot;client&quot; is referring to the caller or
guest that is consuming this interface. Once a write request is committed by a specific client,
all subsequent read requests by the same client will reflect that write or any subsequent
writes. Another client running in a different context may or may not immediately see the result
due to the replication lag. As an example of all of this, if a value at a given key is A, and
the client writes B, then immediately reads, it should get B. If something else writes C in
quick succession, then the client may get C. However, a client running in a separate context may
still see A or B</p>
<hr />
<h3>Types</h3>
<h4><a id="error"></a><code>variant error</code></h4>
<p>The set of errors which may be raised by functions in this package</p>
<h5>Variant Cases</h5>
<ul>
<li>
<p><a id="error.no_such_store"></a><code>no-such-store</code></p>
<p>The host does not recognize the store identifier requested.
</li>
<li>
<p><a id="error.access_denied"></a><code>access-denied</code></p>
<p>The requesting component does not have access to the specified store
(which may or may not exist).
</li>
<li>
<p><a id="error.other"></a><code>other</code>: <code>string</code></p>
<p>Some implementation-specific error has occurred (e.g. I/O)
</li>
</ul>
<h4><a id="key_response"></a><code>record key-response</code></h4>
<p>A response to a <a href="#list_keys"><code>list-keys</code></a> operation.</p>
<h5>Record Fields</h5>
<ul>
<li>
<p><a id="key_response.keys"></a><code>keys</code>: list&lt;<code>string</code>&gt;</p>
<p>The list of keys returned by the query.
</li>
<li>
<p><a id="key_response.cursor"></a><code>cursor</code>: option&lt;<code>u64</code>&gt;</p>
<p>The continuation token to use to fetch the next page of keys. If this is `null`, then
there are no more keys to fetch.
</li>
</ul>
<hr />
<h3>Functions</h3>
<h4><a id="get"></a><code>get: func</code></h4>
<p>A bucket is a collection of key-value pairs. Each key-value pair is stored as a entry in the
bucket, and the bucket itself acts as a collection of all these entries.</p>
<p>It is worth noting that the exact terminology for bucket in key-value stores can very
depending on the specific implementation. For example:</p>
<ol>
<li>Amazon DynamoDB calls a collection of key-value pairs a table</li>
<li>Redis has hashes, sets, and sorted sets as different types of collections</li>
<li>Cassandra calls a collection of key-value pairs a column family</li>
<li>MongoDB calls a collection of key-value pairs a collection</li>
<li>Riak calls a collection of key-value pairs a bucket</li>
<li>Memcached calls a collection of key-value pairs a slab</li>
<li>Azure Cosmos DB calls a collection of key-value pairs a container</li>
</ol>
<p>In this interface, we use the term <code>bucket</code> to refer to a collection of key-value pairs
Get the value associated with the specified <code>key</code></p>
<p>The value is returned as an option. If the key-value pair exists in the
store, it returns <code>Ok(value)</code>. If the key does not exist in the
store, it returns <code>Ok(none)</code>.</p>
<p>If any other error occurs, it returns an <code>Err(error)</code>.</p>
<h5>Params</h5>
<ul>
<li><a id="get.bucket"></a><code>bucket</code>: <code>string</code></li>
<li><a id="get.key"></a><code>key</code>: <code>string</code></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="get.0"></a> result&lt;option&lt;list&lt;<code>u8</code>&gt;&gt;, <a href="#error"><a href="#error"><code>error</code></a></a>&gt;</li>
</ul>
<h4><a id="set"></a><code>set: func</code></h4>
<p>Set the value associated with the key in the store. If the key already
exists in the store, it overwrites the value.</p>
<p>If the key does not exist in the store, it creates a new key-value pair.</p>
<p>If any other error occurs, it returns an <code>Err(error)</code>.</p>
<h5>Params</h5>
<ul>
<li><a id="set.bucket"></a><code>bucket</code>: <code>string</code></li>
<li><a id="set.key"></a><code>key</code>: <code>string</code></li>
<li><a id="set.value"></a><code>value</code>: list&lt;<code>u8</code>&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="set.0"></a> result&lt;_, <a href="#error"><a href="#error"><code>error</code></a></a>&gt;</li>
</ul>
<h4><a id="delete"></a><code>delete: func</code></h4>
<p>Delete the key-value pair associated with the key in the store.</p>
<p>If the key does not exist in the store, it does nothing.</p>
<p>If any other error occurs, it returns an <code>Err(error)</code>.</p>
<h5>Params</h5>
<ul>
<li><a id="delete.bucket"></a><code>bucket</code>: <code>string</code></li>
<li><a id="delete.key"></a><code>key</code>: <code>string</code></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="delete.0"></a> result&lt;_, <a href="#error"><a href="#error"><code>error</code></a></a>&gt;</li>
</ul>
<h4><a id="exists"></a><code>exists: func</code></h4>
<p>Check if the key exists in the store.</p>
<p>If the key exists in the store, it returns <code>Ok(true)</code>. If the key does
not exist in the store, it returns <code>Ok(false)</code>.</p>
<p>If any other error occurs, it returns an <code>Err(error)</code>.</p>
<h5>Params</h5>
<ul>
<li><a id="exists.bucket"></a><code>bucket</code>: <code>string</code></li>
<li><a id="exists.key"></a><code>key</code>: <code>string</code></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="exists.0"></a> result&lt;<code>bool</code>, <a href="#error"><a href="#error"><code>error</code></a></a>&gt;</li>
</ul>
<h4><a id="list_keys"></a><code>list-keys: func</code></h4>
<p>Get all the keys in the store with an optional cursor (for use in pagination). It
returns a list of keys. Please note that for most KeyValue implementations, this is a
can be a very expensive operation and so it should be used judiciously. Implementations
can return any number of keys in a single response, but they should never attempt to
send more data than is reasonable (i.e. on a small edge device, this may only be a few
KB, while on a large machine this could be several MB). Any response should also return
a cursor that can be used to fetch the next page of keys. See the <a href="#key_response"><code>key-response</code></a> record
for more information.</p>
<p>Note that the keys are not guaranteed to be returned in any particular order.</p>
<p>If the store is empty, it returns an empty list.</p>
<p>MAY show an out-of-date list of keys if there are concurrent writes to the store.</p>
<p>If any error occurs, it returns an <code>Err(error)</code>.</p>
<h5>Params</h5>
<ul>
<li><a id="list_keys.bucket"></a><code>bucket</code>: <code>string</code></li>
<li><a id="list_keys.cursor"></a><code>cursor</code>: option&lt;<code>u64</code>&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="list_keys.0"></a> result&lt;<a href="#key_response"><a href="#key_response"><code>key-response</code></a></a>, <a href="#error"><a href="#error"><code>error</code></a></a>&gt;</li>
</ul>
<h2><a id="wrpc_keyvalue_atomics_0_2_0_draft"></a>Import interface wrpc:keyvalue/atomics@0.2.0-draft</h2>
<p>A keyvalue interface that provides atomic operations.</p>
<p>Atomic operations are single, indivisible operations. When a fault causes an atomic operation to
fail, it will appear to the invoker of the atomic operation that the action either completed
successfully or did nothing at all.</p>
<p>Please note that this interface is bare functions that take a reference to a bucket. This is to
get around the current lack of a way to &quot;extend&quot; a resource with additional methods inside of
wit. Future version of the interface will instead extend these methods on the base <code>bucket</code>
resource.</p>
<hr />
<h3>Types</h3>
<h4><a id="error"></a><code>type error</code></h4>
<p><a href="#error"><a href="#error"><code>error</code></a></a></p>
<p>
----
<h3>Functions</h3>
<h4><a id="increment"></a><code>increment: func</code></h4>
<p>Atomically increment the value associated with the key in the store by the given delta. It
returns the new value.</p>
<p>If the key does not exist in the store, it creates a new key-value pair with the value set
to the given delta.</p>
<p>If any other error occurs, it returns an <code>Err(error)</code>.</p>
<h5>Params</h5>
<ul>
<li><a id="increment.bucket"></a><code>bucket</code>: <code>string</code></li>
<li><a id="increment.key"></a><code>key</code>: <code>string</code></li>
<li><a id="increment.delta"></a><code>delta</code>: <code>u64</code></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="increment.0"></a> result&lt;<code>u64</code>, <a href="#error"><a href="#error"><code>error</code></a></a>&gt;</li>
</ul>
<h2><a id="wrpc_keyvalue_batch_0_2_0_draft"></a>Import interface wrpc:keyvalue/batch@0.2.0-draft</h2>
<p>A keyvalue interface that provides batch operations.</p>
<p>A batch operation is an operation that operates on multiple keys at once.</p>
<p>Batch operations are useful for reducing network round-trip time. For example, if you want to
get the values associated with 100 keys, you can either do 100 get operations or you can do 1
batch get operation. The batch operation is faster because it only needs to make 1 network call
instead of 100.</p>
<p>A batch operation does not guarantee atomicity, meaning that if the batch operation fails, some
of the keys may have been modified and some may not.</p>
<p>This interface does has the same consistency guarantees as the <code>store</code> interface, meaning that
you should be able to &quot;read your writes.&quot;</p>
<p>Please note that this interface is bare functions that take a reference to a bucket. This is to
get around the current lack of a way to &quot;extend&quot; a resource with additional methods inside of
wit. Future version of the interface will instead extend these methods on the base <code>bucket</code>
resource.</p>
<hr />
<h3>Types</h3>
<h4><a id="error"></a><code>type error</code></h4>
<p><a href="#error"><a href="#error"><code>error</code></a></a></p>
<p>
----
<h3>Functions</h3>
<h4><a id="get_many"></a><code>get-many: func</code></h4>
<p>Get the key-value pairs associated with the keys in the store. It returns a list of
key-value pairs.</p>
<p>If any of the keys do not exist in the store, it returns a <code>none</code> value for that pair in the
list.</p>
<p>MAY show an out-of-date value if there are concurrent writes to the store.</p>
<p>If any other error occurs, it returns an <code>Err(error)</code>.</p>
<h5>Params</h5>
<ul>
<li><a id="get_many.bucket"></a><code>bucket</code>: <code>string</code></li>
<li><a id="get_many.keys"></a><code>keys</code>: list&lt;<code>string</code>&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="get_many.0"></a> result&lt;list&lt;option&lt;(<code>string</code>, list&lt;<code>u8</code>&gt;)&gt;&gt;, <a href="#error"><a href="#error"><code>error</code></a></a>&gt;</li>
</ul>
<h4><a id="set_many"></a><code>set-many: func</code></h4>
<p>Set the values associated with the keys in the store. If the key already exists in the
store, it overwrites the value.</p>
<p>Note that the key-value pairs are not guaranteed to be set in the order they are provided.</p>
<p>If any of the keys do not exist in the store, it creates a new key-value pair.</p>
<p>If any other error occurs, it returns an <code>Err(error)</code>. When an error occurs, it does not
rollback the key-value pairs that were already set. Thus, this batch operation does not
guarantee atomicity, implying that some key-value pairs could be set while others might
fail.</p>
<p>Other concurrent operations may also be able to see the partial results.</p>
<h5>Params</h5>
<ul>
<li><a id="set_many.bucket"></a><code>bucket</code>: <code>string</code></li>
<li><a id="set_many.key_values"></a><code>key-values</code>: list&lt;(<code>string</code>, list&lt;<code>u8</code>&gt;)&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="set_many.0"></a> result&lt;_, <a href="#error"><a href="#error"><code>error</code></a></a>&gt;</li>
</ul>
<h4><a id="delete_many"></a><code>delete-many: func</code></h4>
<p>Delete the key-value pairs associated with the keys in the store.</p>
<p>Note that the key-value pairs are not guaranteed to be deleted in the order they are
provided.</p>
<p>If any of the keys do not exist in the store, it skips the key.</p>
<p>If any other error occurs, it returns an <code>Err(error)</code>. When an error occurs, it does not
rollback the key-value pairs that were already deleted. Thus, this batch operation does not
guarantee atomicity, implying that some key-value pairs could be deleted while others might
fail.</p>
<p>Other concurrent operations may also be able to see the partial results.</p>
<h5>Params</h5>
<ul>
<li><a id="delete_many.bucket"></a><code>bucket</code>: <code>string</code></li>
<li><a id="delete_many.keys"></a><code>keys</code>: list&lt;<code>string</code>&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="delete_many.0"></a> result&lt;_, <a href="#error"><a href="#error"><code>error</code></a></a>&gt;</li>
</ul>
<h2><a id="wasi_io_error_0_2_0"></a>Import interface wasi:io/error@0.2.0</h2>
<hr />
<h3>Types</h3>
<h4><a id="error"></a><code>resource error</code></h4>
<p>A resource which represents some error information.</p>
<p>The only method provided by this resource is <code>to-debug-string</code>,
which provides some human-readable information about the error.</p>
<p>In the <code>wasi:io</code> package, this resource is returned through the
<code>wasi:io/streams/stream-error</code> type.</p>
<p>To provide more specific error information, other interfaces may
provide functions to further &quot;downcast&quot; this error into more specific
error information. For example, <a href="#error"><code>error</code></a>s returned in streams derived
from filesystem types to be described using the filesystem's own
error-code type, using the function
<code>wasi:filesystem/types/filesystem-error-code</code>, which takes a parameter
<code>borrow&lt;error&gt;</code> and returns
<code>option&lt;wasi:filesystem/types/error-code&gt;</code>.</p>
<h2>The set of functions which can &quot;downcast&quot; an <a href="#error"><code>error</code></a> into a more
concrete type is open.</h2>
<h3>Functions</h3>
<h4><a id="method_error_to_debug_string"></a><code>[method]error.to-debug-string: func</code></h4>
<p>Returns a string that is suitable to assist humans in debugging
this error.</p>
<p>WARNING: The returned string should not be consumed mechanically!
It may change across platforms, hosts, or other implementation
details. Parsing this string is a major platform-compatibility
hazard.</p>
<h5>Params</h5>
<ul>
<li><a id="method_error_to_debug_string.self"></a><code>self</code>: borrow&lt;<a href="#error"><a href="#error"><code>error</code></a></a>&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="method_error_to_debug_string.0"></a> <code>string</code></li>
</ul>
<h2><a id="wasi_io_poll_0_2_0"></a>Import interface wasi:io/poll@0.2.0</h2>
<p>A poll API intended to let users wait for I/O events on multiple handles
at once.</p>
<hr />
<h3>Types</h3>
<h4><a id="pollable"></a><code>resource pollable</code></h4>
<h2><a href="#pollable"><code>pollable</code></a> represents a single I/O event which may be ready, or not.</h2>
<h3>Functions</h3>
<h4><a id="method_pollable_ready"></a><code>[method]pollable.ready: func</code></h4>
<p>Return the readiness of a pollable. This function never blocks.</p>
<p>Returns <code>true</code> when the pollable is ready, and <code>false</code> otherwise.</p>
<h5>Params</h5>
<ul>
<li><a id="method_pollable_ready.self"></a><code>self</code>: borrow&lt;<a href="#pollable"><a href="#pollable"><code>pollable</code></a></a>&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="method_pollable_ready.0"></a> <code>bool</code></li>
</ul>
<h4><a id="method_pollable_block"></a><code>[method]pollable.block: func</code></h4>
<p><code>block</code> returns immediately if the pollable is ready, and otherwise
blocks until ready.</p>
<p>This function is equivalent to calling <code>poll.poll</code> on a list
containing only this pollable.</p>
<h5>Params</h5>
<ul>
<li><a id="method_pollable_block.self"></a><code>self</code>: borrow&lt;<a href="#pollable"><a href="#pollable"><code>pollable</code></a></a>&gt;</li>
</ul>
<h4><a id="poll"></a><code>poll: func</code></h4>
<p>Poll for completion on a set of pollables.</p>
<p>This function takes a list of pollables, which identify I/O sources of
interest, and waits until one or more of the events is ready for I/O.</p>
<p>The result <code>list&lt;u32&gt;</code> contains one or more indices of handles in the
argument list that is ready for I/O.</p>
<p>If the list contains more elements than can be indexed with a <code>u32</code>
value, this function traps.</p>
<p>A timeout can be implemented by adding a pollable from the
wasi-clocks API to the list.</p>
<p>This function does not return a <code>result</code>; polling in itself does not
do any I/O so it doesn't fail. If any of the I/O sources identified by
the pollables has an error, it is indicated by marking the source as
being reaedy for I/O.</p>
<h5>Params</h5>
<ul>
<li><a id="poll.in"></a><code>in</code>: list&lt;borrow&lt;<a href="#pollable"><a href="#pollable"><code>pollable</code></a></a>&gt;&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="poll.0"></a> list&lt;<code>u32</code>&gt;</li>
</ul>
<h2><a id="wasi_io_streams_0_2_0"></a>Import interface wasi:io/streams@0.2.0</h2>
<p>WASI I/O is an I/O abstraction API which is currently focused on providing
stream types.</p>
<p>In the future, the component model is expected to add built-in stream types;
when it does, they are expected to subsume this API.</p>
<hr />
<h3>Types</h3>
<h4><a id="error"></a><code>type error</code></h4>
<p><a href="#error"><a href="#error"><code>error</code></a></a></p>
<p>
#### <a id="pollable"></a>`type pollable`
[`pollable`](#pollable)
<p>
#### <a id="stream_error"></a>`variant stream-error`
<p>An error for input-stream and output-stream operations.</p>
<h5>Variant Cases</h5>
<ul>
<li>
<p><a id="stream_error.last_operation_failed"></a><code>last-operation-failed</code>: own&lt;<a href="#error"><a href="#error"><code>error</code></a></a>&gt;</p>
<p>The last operation (a write or flush) failed before completion.
<p>More information is available in the <a href="#error"><code>error</code></a> payload.</p>
</li>
<li>
<p><a id="stream_error.closed"></a><code>closed</code></p>
<p>The stream is closed: no more input will be accepted by the
stream. A closed output-stream will return this error on all
future operations.
</li>
</ul>
<h4><a id="input_stream"></a><code>resource input-stream</code></h4>
<p>An input bytestream.</p>
<p><a href="#input_stream"><code>input-stream</code></a>s are <em>non-blocking</em> to the extent practical on underlying
platforms. I/O operations always return promptly; if fewer bytes are
promptly available than requested, they return the number of bytes promptly
available, which could even be zero. To wait for data to be available,
use the <code>subscribe</code> function to obtain a <a href="#pollable"><code>pollable</code></a> which can be polled
for using <code>wasi:io/poll</code>.</p>
<h4><a id="output_stream"></a><code>resource output-stream</code></h4>
<p>An output bytestream.</p>
<h2><a href="#output_stream"><code>output-stream</code></a>s are <em>non-blocking</em> to the extent practical on
underlying platforms. Except where specified otherwise, I/O operations also
always return promptly, after the number of bytes that can be written
promptly, which could even be zero. To wait for the stream to be ready to
accept data, the <code>subscribe</code> function to obtain a <a href="#pollable"><code>pollable</code></a> which can be
polled for using <code>wasi:io/poll</code>.</h2>
<h3>Functions</h3>
<h4><a id="method_input_stream_read"></a><code>[method]input-stream.read: func</code></h4>
<p>Perform a non-blocking read from the stream.</p>
<p>When the source of a <code>read</code> is binary data, the bytes from the source
are returned verbatim. When the source of a <code>read</code> is known to the
implementation to be text, bytes containing the UTF-8 encoding of the
text are returned.</p>
<p>This function returns a list of bytes containing the read data,
when successful. The returned list will contain up to <code>len</code> bytes;
it may return fewer than requested, but not more. The list is
empty when no bytes are available for reading at this time. The
pollable given by <code>subscribe</code> will be ready when more bytes are
available.</p>
<p>This function fails with a <a href="#stream_error"><code>stream-error</code></a> when the operation
encounters an error, giving <code>last-operation-failed</code>, or when the
stream is closed, giving <code>closed</code>.</p>
<p>When the caller gives a <code>len</code> of 0, it represents a request to
read 0 bytes. If the stream is still open, this call should
succeed and return an empty list, or otherwise fail with <code>closed</code>.</p>
<p>The <code>len</code> parameter is a <code>u64</code>, which could represent a list of u8 which
is not possible to allocate in wasm32, or not desirable to allocate as
as a return value by the callee. The callee may return a list of bytes
less than <code>len</code> in size while more bytes are available for reading.</p>
<h5>Params</h5>
<ul>
<li><a id="method_input_stream_read.self"></a><code>self</code>: borrow&lt;<a href="#input_stream"><a href="#input_stream"><code>input-stream</code></a></a>&gt;</li>
<li><a id="method_input_stream_read.len"></a><code>len</code>: <code>u64</code></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="method_input_stream_read.0"></a> result&lt;list&lt;<code>u8</code>&gt;, <a href="#stream_error"><a href="#stream_error"><code>stream-error</code></a></a>&gt;</li>
</ul>
<h4><a id="method_input_stream_blocking_read"></a><code>[method]input-stream.blocking-read: func</code></h4>
<p>Read bytes from a stream, after blocking until at least one byte can
be read. Except for blocking, behavior is identical to <code>read</code>.</p>
<h5>Params</h5>
<ul>
<li><a id="method_input_stream_blocking_read.self"></a><code>self</code>: borrow&lt;<a href="#input_stream"><a href="#input_stream"><code>input-stream</code></a></a>&gt;</li>
<li><a id="method_input_stream_blocking_read.len"></a><code>len</code>: <code>u64</code></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="method_input_stream_blocking_read.0"></a> result&lt;list&lt;<code>u8</code>&gt;, <a href="#stream_error"><a href="#stream_error"><code>stream-error</code></a></a>&gt;</li>
</ul>
<h4><a id="method_input_stream_skip"></a><code>[method]input-stream.skip: func</code></h4>
<p>Skip bytes from a stream. Returns number of bytes skipped.</p>
<p>Behaves identical to <code>read</code>, except instead of returning a list
of bytes, returns the number of bytes consumed from the stream.</p>
<h5>Params</h5>
<ul>
<li><a id="method_input_stream_skip.self"></a><code>self</code>: borrow&lt;<a href="#input_stream"><a href="#input_stream"><code>input-stream</code></a></a>&gt;</li>
<li><a id="method_input_stream_skip.len"></a><code>len</code>: <code>u64</code></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="method_input_stream_skip.0"></a> result&lt;<code>u64</code>, <a href="#stream_error"><a href="#stream_error"><code>stream-error</code></a></a>&gt;</li>
</ul>
<h4><a id="method_input_stream_blocking_skip"></a><code>[method]input-stream.blocking-skip: func</code></h4>
<p>Skip bytes from a stream, after blocking until at least one byte
can be skipped. Except for blocking behavior, identical to <code>skip</code>.</p>
<h5>Params</h5>
<ul>
<li><a id="method_input_stream_blocking_skip.self"></a><code>self</code>: borrow&lt;<a href="#input_stream"><a href="#input_stream"><code>input-stream</code></a></a>&gt;</li>
<li><a id="method_input_stream_blocking_skip.len"></a><code>len</code>: <code>u64</code></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="method_input_stream_blocking_skip.0"></a> result&lt;<code>u64</code>, <a href="#stream_error"><a href="#stream_error"><code>stream-error</code></a></a>&gt;</li>
</ul>
<h4><a id="method_input_stream_subscribe"></a><code>[method]input-stream.subscribe: func</code></h4>
<p>Create a <a href="#pollable"><code>pollable</code></a> which will resolve once either the specified stream
has bytes available to read or the other end of the stream has been
closed.
The created <a href="#pollable"><code>pollable</code></a> is a child resource of the <a href="#input_stream"><code>input-stream</code></a>.
Implementations may trap if the <a href="#input_stream"><code>input-stream</code></a> is dropped before
all derived <a href="#pollable"><code>pollable</code></a>s created with this function are dropped.</p>
<h5>Params</h5>
<ul>
<li><a id="method_input_stream_subscribe.self"></a><code>self</code>: borrow&lt;<a href="#input_stream"><a href="#input_stream"><code>input-stream</code></a></a>&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="method_input_stream_subscribe.0"></a> own&lt;<a href="#pollable"><a href="#pollable"><code>pollable</code></a></a>&gt;</li>
</ul>
<h4><a id="method_output_stream_check_write"></a><code>[method]output-stream.check-write: func</code></h4>
<p>Check readiness for writing. This function never blocks.</p>
<p>Returns the number of bytes permitted for the next call to <code>write</code>,
or an error. Calling <code>write</code> with more bytes than this function has
permitted will trap.</p>
<p>When this function returns 0 bytes, the <code>subscribe</code> pollable will
become ready when this function will report at least 1 byte, or an
error.</p>
<h5>Params</h5>
<ul>
<li><a id="method_output_stream_check_write.self"></a><code>self</code>: borrow&lt;<a href="#output_stream"><a href="#output_stream"><code>output-stream</code></a></a>&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="method_output_stream_check_write.0"></a> result&lt;<code>u64</code>, <a href="#stream_error"><a href="#stream_error"><code>stream-error</code></a></a>&gt;</li>
</ul>
<h4><a id="method_output_stream_write"></a><code>[method]output-stream.write: func</code></h4>
<p>Perform a write. This function never blocks.</p>
<p>When the destination of a <code>write</code> is binary data, the bytes from
<code>contents</code> are written verbatim. When the destination of a <code>write</code> is
known to the implementation to be text, the bytes of <code>contents</code> are
transcoded from UTF-8 into the encoding of the destination and then
written.</p>
<p>Precondition: check-write gave permit of Ok(n) and contents has a
length of less than or equal to n. Otherwise, this function will trap.</p>
<p>returns Err(closed) without writing if the stream has closed since
the last call to check-write provided a permit.</p>
<h5>Params</h5>
<ul>
<li><a id="method_output_stream_write.self"></a><code>self</code>: borrow&lt;<a href="#output_stream"><a href="#output_stream"><code>output-stream</code></a></a>&gt;</li>
<li><a id="method_output_stream_write.contents"></a><code>contents</code>: list&lt;<code>u8</code>&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="method_output_stream_write.0"></a> result&lt;_, <a href="#stream_error"><a href="#stream_error"><code>stream-error</code></a></a>&gt;</li>
</ul>
<h4><a id="method_output_stream_blocking_write_and_flush"></a><code>[method]output-stream.blocking-write-and-flush: func</code></h4>
<p>Perform a write of up to 4096 bytes, and then flush the stream. Block
until all of these operations are complete, or an error occurs.</p>
<p>This is a convenience wrapper around the use of <code>check-write</code>,
<code>subscribe</code>, <code>write</code>, and <code>flush</code>, and is implemented with the
following pseudo-code:</p>
<pre><code class="language-text">let pollable = this.subscribe();
while !contents.is_empty() {
  // Wait for the stream to become writable
  pollable.block();
  let Ok(n) = this.check-write(); // eliding error handling
  let len = min(n, contents.len());
  let (chunk, rest) = contents.split_at(len);
  this.write(chunk  );            // eliding error handling
  contents = rest;
}
this.flush();
// Wait for completion of `flush`
pollable.block();
// Check for any errors that arose during `flush`
let _ = this.check-write();         // eliding error handling
</code></pre>
<h5>Params</h5>
<ul>
<li><a id="method_output_stream_blocking_write_and_flush.self"></a><code>self</code>: borrow&lt;<a href="#output_stream"><a href="#output_stream"><code>output-stream</code></a></a>&gt;</li>
<li><a id="method_output_stream_blocking_write_and_flush.contents"></a><code>contents</code>: list&lt;<code>u8</code>&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="method_output_stream_blocking_write_and_flush.0"></a> result&lt;_, <a href="#stream_error"><a href="#stream_error"><code>stream-error</code></a></a>&gt;</li>
</ul>
<h4><a id="method_output_stream_flush"></a><code>[method]output-stream.flush: func</code></h4>
<p>Request to flush buffered output. This function never blocks.</p>
<p>This tells the output-stream that the caller intends any buffered
output to be flushed. the output which is expected to be flushed
is all that has been passed to <code>write</code> prior to this call.</p>
<p>Upon calling this function, the <a href="#output_stream"><code>output-stream</code></a> will not accept any
writes (<code>check-write</code> will return <code>ok(0)</code>) until the flush has
completed. The <code>subscribe</code> pollable will become ready when the
flush has completed and the stream can accept more writes.</p>
<h5>Params</h5>
<ul>
<li><a id="method_output_stream_flush.self"></a><code>self</code>: borrow&lt;<a href="#output_stream"><a href="#output_stream"><code>output-stream</code></a></a>&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="method_output_stream_flush.0"></a> result&lt;_, <a href="#stream_error"><a href="#stream_error"><code>stream-error</code></a></a>&gt;</li>
</ul>
<h4><a id="method_output_stream_blocking_flush"></a><code>[method]output-stream.blocking-flush: func</code></h4>
<p>Request to flush buffered output, and block until flush completes
and stream is ready for writing again.</p>
<h5>Params</h5>
<ul>
<li><a id="method_output_stream_blocking_flush.self"></a><code>self</code>: borrow&lt;<a href="#output_stream"><a href="#output_stream"><code>output-stream</code></a></a>&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="method_output_stream_blocking_flush.0"></a> result&lt;_, <a href="#stream_error"><a href="#stream_error"><code>stream-error</code></a></a>&gt;</li>
</ul>
<h4><a id="method_output_stream_subscribe"></a><code>[method]output-stream.subscribe: func</code></h4>
<p>Create a <a href="#pollable"><code>pollable</code></a> which will resolve once the output-stream
is ready for more writing, or an error has occured. When this
pollable is ready, <code>check-write</code> will return <code>ok(n)</code> with n&gt;0, or an
error.</p>
<p>If the stream is closed, this pollable is always ready immediately.</p>
<p>The created <a href="#pollable"><code>pollable</code></a> is a child resource of the <a href="#output_stream"><code>output-stream</code></a>.
Implementations may trap if the <a href="#output_stream"><code>output-stream</code></a> is dropped before
all derived <a href="#pollable"><code>pollable</code></a>s created with this function are dropped.</p>
<h5>Params</h5>
<ul>
<li><a id="method_output_stream_subscribe.self"></a><code>self</code>: borrow&lt;<a href="#output_stream"><a href="#output_stream"><code>output-stream</code></a></a>&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="method_output_stream_subscribe.0"></a> own&lt;<a href="#pollable"><a href="#pollable"><code>pollable</code></a></a>&gt;</li>
</ul>
<h4><a id="method_output_stream_write_zeroes"></a><code>[method]output-stream.write-zeroes: func</code></h4>
<p>Write zeroes to a stream.</p>
<p>This should be used precisely like <code>write</code> with the exact same
preconditions (must use check-write first), but instead of
passing a list of bytes, you simply pass the number of zero-bytes
that should be written.</p>
<h5>Params</h5>
<ul>
<li><a id="method_output_stream_write_zeroes.self"></a><code>self</code>: borrow&lt;<a href="#output_stream"><a href="#output_stream"><code>output-stream</code></a></a>&gt;</li>
<li><a id="method_output_stream_write_zeroes.len"></a><code>len</code>: <code>u64</code></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="method_output_stream_write_zeroes.0"></a> result&lt;_, <a href="#stream_error"><a href="#stream_error"><code>stream-error</code></a></a>&gt;</li>
</ul>
<h4><a id="method_output_stream_blocking_write_zeroes_and_flush"></a><code>[method]output-stream.blocking-write-zeroes-and-flush: func</code></h4>
<p>Perform a write of up to 4096 zeroes, and then flush the stream.
Block until all of these operations are complete, or an error
occurs.</p>
<p>This is a convenience wrapper around the use of <code>check-write</code>,
<code>subscribe</code>, <code>write-zeroes</code>, and <code>flush</code>, and is implemented with
the following pseudo-code:</p>
<pre><code class="language-text">let pollable = this.subscribe();
while num_zeroes != 0 {
  // Wait for the stream to become writable
  pollable.block();
  let Ok(n) = this.check-write(); // eliding error handling
  let len = min(n, num_zeroes);
  this.write-zeroes(len);         // eliding error handling
  num_zeroes -= len;
}
this.flush();
// Wait for completion of `flush`
pollable.block();
// Check for any errors that arose during `flush`
let _ = this.check-write();         // eliding error handling
</code></pre>
<h5>Params</h5>
<ul>
<li><a id="method_output_stream_blocking_write_zeroes_and_flush.self"></a><code>self</code>: borrow&lt;<a href="#output_stream"><a href="#output_stream"><code>output-stream</code></a></a>&gt;</li>
<li><a id="method_output_stream_blocking_write_zeroes_and_flush.len"></a><code>len</code>: <code>u64</code></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="method_output_stream_blocking_write_zeroes_and_flush.0"></a> result&lt;_, <a href="#stream_error"><a href="#stream_error"><code>stream-error</code></a></a>&gt;</li>
</ul>
<h4><a id="method_output_stream_splice"></a><code>[method]output-stream.splice: func</code></h4>
<p>Read from one stream and write to another.</p>
<p>The behavior of splice is equivelant to:</p>
<ol>
<li>calling <code>check-write</code> on the <a href="#output_stream"><code>output-stream</code></a></li>
<li>calling <code>read</code> on the <a href="#input_stream"><code>input-stream</code></a> with the smaller of the
<code>check-write</code> permitted length and the <code>len</code> provided to <code>splice</code></li>
<li>calling <code>write</code> on the <a href="#output_stream"><code>output-stream</code></a> with that read data.</li>
</ol>
<p>Any error reported by the call to <code>check-write</code>, <code>read</code>, or
<code>write</code> ends the splice and reports that error.</p>
<p>This function returns the number of bytes transferred; it may be less
than <code>len</code>.</p>
<h5>Params</h5>
<ul>
<li><a id="method_output_stream_splice.self"></a><code>self</code>: borrow&lt;<a href="#output_stream"><a href="#output_stream"><code>output-stream</code></a></a>&gt;</li>
<li><a id="method_output_stream_splice.src"></a><code>src</code>: borrow&lt;<a href="#input_stream"><a href="#input_stream"><code>input-stream</code></a></a>&gt;</li>
<li><a id="method_output_stream_splice.len"></a><code>len</code>: <code>u64</code></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="method_output_stream_splice.0"></a> result&lt;<code>u64</code>, <a href="#stream_error"><a href="#stream_error"><code>stream-error</code></a></a>&gt;</li>
</ul>
<h4><a id="method_output_stream_blocking_splice"></a><code>[method]output-stream.blocking-splice: func</code></h4>
<p>Read from one stream and write to another, with blocking.</p>
<p>This is similar to <code>splice</code>, except that it blocks until the
<a href="#output_stream"><code>output-stream</code></a> is ready for writing, and the <a href="#input_stream"><code>input-stream</code></a>
is ready for reading, before performing the <code>splice</code>.</p>
<h5>Params</h5>
<ul>
<li><a id="method_output_stream_blocking_splice.self"></a><code>self</code>: borrow&lt;<a href="#output_stream"><a href="#output_stream"><code>output-stream</code></a></a>&gt;</li>
<li><a id="method_output_stream_blocking_splice.src"></a><code>src</code>: borrow&lt;<a href="#input_stream"><a href="#input_stream"><code>input-stream</code></a></a>&gt;</li>
<li><a id="method_output_stream_blocking_splice.len"></a><code>len</code>: <code>u64</code></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="method_output_stream_blocking_splice.0"></a> result&lt;<code>u64</code>, <a href="#stream_error"><a href="#stream_error"><code>stream-error</code></a></a>&gt;</li>
</ul>
<h2><a id="wasi_blobstore_types_0_2_0_draft"></a>Import interface wasi:blobstore/types@0.2.0-draft</h2>
<p>Types used by blobstore</p>
<hr />
<h3>Types</h3>
<h4><a id="input_stream"></a><code>type input-stream</code></h4>
<p><a href="#input_stream"><a href="#input_stream"><code>input-stream</code></a></a></p>
<p>
#### <a id="output_stream"></a>`type output-stream`
[`output-stream`](#output_stream)
<p>
#### <a id="container_name"></a>`type container-name`
`string`
<p>name of a container, a collection of objects.
The container name may be any valid UTF-8 string.
<h4><a id="object_name"></a><code>type object-name</code></h4>
<p><code>string</code></p>
<p>name of an object within a container
The object name may be any valid UTF-8 string.
<h4><a id="timestamp"></a><code>type timestamp</code></h4>
<p><code>u64</code></p>
<p>TODO: define timestamp to include seconds since
Unix epoch and nanoseconds
https://github.com/WebAssembly/wasi-blob-store/issues/7
<h4><a id="object_size"></a><code>type object-size</code></h4>
<p><code>u64</code></p>
<p>size of an object, in bytes
<h4><a id="error"></a><code>type error</code></h4>
<p><code>string</code></p>
<p>
#### <a id="container_metadata"></a>`record container-metadata`
<p>information about a container</p>
<h5>Record Fields</h5>
<ul>
<li>
<p><a id="container_metadata.name"></a><code>name</code>: <a href="#container_name"><a href="#container_name"><code>container-name</code></a></a></p>
<p>the container's name
</li>
<li>
<p><a id="container_metadata.created_at"></a><code>created-at</code>: <a href="#timestamp"><a href="#timestamp"><code>timestamp</code></a></a></p>
<p>date and time container was created
</li>
</ul>
<h4><a id="object_metadata"></a><code>record object-metadata</code></h4>
<p>information about an object</p>
<h5>Record Fields</h5>
<ul>
<li>
<p><a id="object_metadata.name"></a><code>name</code>: <a href="#object_name"><a href="#object_name"><code>object-name</code></a></a></p>
<p>the object's name
</li>
<li>
<p><a id="object_metadata.container"></a><code>container</code>: <a href="#container_name"><a href="#container_name"><code>container-name</code></a></a></p>
<p>the object's parent container
</li>
<li>
<p><a id="object_metadata.created_at"></a><code>created-at</code>: <a href="#timestamp"><a href="#timestamp"><code>timestamp</code></a></a></p>
<p>date and time the object was created
</li>
<li>
<p><a id="object_metadata.size"></a><code>size</code>: <a href="#object_size"><a href="#object_size"><code>object-size</code></a></a></p>
<p>size of the object, in bytes
</li>
</ul>
<h4><a id="object_id"></a><code>record object-id</code></h4>
<p>identifier for an object that includes its container name</p>
<h5>Record Fields</h5>
<ul>
<li><a id="object_id.container"></a><code>container</code>: <a href="#container_name"><a href="#container_name"><code>container-name</code></a></a></li>
<li><a id="object_id.object"></a><code>object</code>: <a href="#object_name"><a href="#object_name"><code>object-name</code></a></a></li>
</ul>
<h4><a id="outgoing_value"></a><code>resource outgoing-value</code></h4>
<p>A data is the data stored in a data blob. The value can be of any type
that can be represented in a byte array. It provides a way to write the value
to the output-stream defined in the <code>wasi-io</code> interface.
Soon: switch to <code>resource value { ... }</code></p>
<h4><a id="incoming_value"></a><code>resource incoming-value</code></h4>
<p>A incoming-value is a wrapper around a value. It provides a way to read the value
from the input-stream defined in the <code>wasi-io</code> interface.</p>
<p>The incoming-value provides two ways to consume the value:</p>
<ol>
<li><code>incoming-value-consume-sync</code> consumes the value synchronously and returns the
value as a list of bytes.</li>
<li><code>incoming-value-consume-async</code> consumes the value asynchronously and returns the
value as an input-stream.
Soon: switch to <code>resource incoming-value { ... }</code></li>
</ol>
<h4><a id="incoming_value_async_body"></a><code>type incoming-value-async-body</code></h4>
<p><a href="#input_stream"><a href="#input_stream"><code>input-stream</code></a></a></p>
<p>
#### <a id="incoming_value_sync_body"></a>`type incoming-value-sync-body`
[`incoming-value-sync-body`](#incoming_value_sync_body)
<p>
----
<h3>Functions</h3>
<h4><a id="static_outgoing_value_new_outgoing_value"></a><code>[static]outgoing-value.new-outgoing-value: func</code></h4>
<h5>Return values</h5>
<ul>
<li><a id="static_outgoing_value_new_outgoing_value.0"></a> own&lt;<a href="#outgoing_value"><a href="#outgoing_value"><code>outgoing-value</code></a></a>&gt;</li>
</ul>
<h4><a id="method_outgoing_value_outgoing_value_write_body"></a><code>[method]outgoing-value.outgoing-value-write-body: func</code></h4>
<p>Returns a stream for writing the value contents.</p>
<p>The returned <a href="#output_stream"><code>output-stream</code></a> is a child resource: it must be dropped
before the parent <a href="#outgoing_value"><code>outgoing-value</code></a> resource is dropped (or finished),
otherwise the <a href="#outgoing_value"><code>outgoing-value</code></a> drop or <code>finish</code> will trap.</p>
<p>Returns success on the first call: the <a href="#output_stream"><code>output-stream</code></a> resource for
this <a href="#outgoing_value"><code>outgoing-value</code></a> may be retrieved at most once. Subsequent calls
will return error.</p>
<h5>Params</h5>
<ul>
<li><a id="method_outgoing_value_outgoing_value_write_body.self"></a><code>self</code>: borrow&lt;<a href="#outgoing_value"><a href="#outgoing_value"><code>outgoing-value</code></a></a>&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="method_outgoing_value_outgoing_value_write_body.0"></a> result&lt;own&lt;<a href="#output_stream"><a href="#output_stream"><code>output-stream</code></a></a>&gt;&gt;</li>
</ul>
<h4><a id="static_outgoing_value_finish"></a><code>[static]outgoing-value.finish: func</code></h4>
<p>Finalize an outgoing value. This must be
called to signal that the outgoing value is complete. If the <a href="#outgoing_value"><code>outgoing-value</code></a>
is dropped without calling <code>outgoing-value.finalize</code>, the implementation
should treat the value as corrupted.</p>
<h5>Params</h5>
<ul>
<li><a id="static_outgoing_value_finish.this"></a><code>this</code>: own&lt;<a href="#outgoing_value"><a href="#outgoing_value"><code>outgoing-value</code></a></a>&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="static_outgoing_value_finish.0"></a> result&lt;_, <a href="#error"><a href="#error"><code>error</code></a></a>&gt;</li>
</ul>
<h4><a id="static_incoming_value_incoming_value_consume_sync"></a><code>[static]incoming-value.incoming-value-consume-sync: func</code></h4>
<h5>Params</h5>
<ul>
<li><a id="static_incoming_value_incoming_value_consume_sync.this"></a><code>this</code>: own&lt;<a href="#incoming_value"><a href="#incoming_value"><code>incoming-value</code></a></a>&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="static_incoming_value_incoming_value_consume_sync.0"></a> result&lt;<a href="#incoming_value_sync_body"><a href="#incoming_value_sync_body"><code>incoming-value-sync-body</code></a></a>, <a href="#error"><a href="#error"><code>error</code></a></a>&gt;</li>
</ul>
<h4><a id="static_incoming_value_incoming_value_consume_async"></a><code>[static]incoming-value.incoming-value-consume-async: func</code></h4>
<h5>Params</h5>
<ul>
<li><a id="static_incoming_value_incoming_value_consume_async.this"></a><code>this</code>: own&lt;<a href="#incoming_value"><a href="#incoming_value"><code>incoming-value</code></a></a>&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="static_incoming_value_incoming_value_consume_async.0"></a> result&lt;own&lt;<a href="#incoming_value_async_body"><a href="#incoming_value_async_body"><code>incoming-value-async-body</code></a></a>&gt;, <a href="#error"><a href="#error"><code>error</code></a></a>&gt;</li>
</ul>
<h4><a id="method_incoming_value_size"></a><code>[method]incoming-value.size: func</code></h4>
<h5>Params</h5>
<ul>
<li><a id="method_incoming_value_size.self"></a><code>self</code>: borrow&lt;<a href="#incoming_value"><a href="#incoming_value"><code>incoming-value</code></a></a>&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="method_incoming_value_size.0"></a> <code>u64</code></li>
</ul>
<h2><a id="wrpc_blobstore_types_0_1_0"></a>Import interface wrpc:blobstore/types@0.1.0</h2>
<hr />
<h3>Types</h3>
<h4><a id="wasi_container_metadata"></a><code>type wasi-container-metadata</code></h4>
<p><a href="#container_metadata"><a href="#container_metadata"><code>container-metadata</code></a></a></p>
<p>
#### <a id="wasi_container_name"></a>`type wasi-container-name`
[`container-name`](#container_name)
<p>
#### <a id="wasi_object_id"></a>`type wasi-object-id`
[`object-id`](#object_id)
<p>
#### <a id="wasi_object_metadata"></a>`type wasi-object-metadata`
[`object-metadata`](#object_metadata)
<p>
#### <a id="timestamp"></a>`type timestamp`
[`timestamp`](#timestamp)
<p>
#### <a id="object_size"></a>`type object-size`
[`object-size`](#object_size)
<p>
#### <a id="container_metadata"></a>`record container-metadata`
<p>information about a container</p>
<h5>Record Fields</h5>
<ul>
<li><a id="container_metadata.created_at"></a><code>created-at</code>: <a href="#timestamp"><a href="#timestamp"><code>timestamp</code></a></a><p>date and time container was created
</li>
</ul>
<h4><a id="container_name"></a><code>type container-name</code></h4>
<p><a href="#wasi_container_name"><a href="#wasi_container_name"><code>wasi-container-name</code></a></a></p>
<p>
#### <a id="object_id"></a>`type object-id`
[`wasi-object-id`](#wasi_object_id)
<p>
#### <a id="object_metadata"></a>`record object-metadata`
<p>information about an object</p>
<h5>Record Fields</h5>
<ul>
<li>
<p><a id="object_metadata.created_at"></a><code>created-at</code>: <a href="#timestamp"><a href="#timestamp"><code>timestamp</code></a></a></p>
<p>date and time the object was created
</li>
<li>
<p><a id="object_metadata.size"></a><code>size</code>: <a href="#object_size"><a href="#object_size"><code>object-size</code></a></a></p>
<p>size of the object, in bytes
</li>
</ul>
<h2><a id="wrpc_blobstore_blobstore_0_1_0"></a>Import interface wrpc:blobstore/blobstore@0.1.0</h2>
<hr />
<h3>Types</h3>
<h4><a id="container_name"></a><code>type container-name</code></h4>
<p><a href="#container_name"><a href="#container_name"><code>container-name</code></a></a></p>
<p>
#### <a id="container_metadata"></a>`type container-metadata`
[`container-metadata`](#container_metadata)
<p>
#### <a id="object_metadata"></a>`type object-metadata`
[`object-metadata`](#object_metadata)
<p>
#### <a id="object_id"></a>`type object-id`
[`object-id`](#object_id)
<p>
----
<h3>Functions</h3>
<h4><a id="clear_container"></a><code>clear-container: func</code></h4>
<h5>Params</h5>
<ul>
<li><a id="clear_container.name"></a><code>name</code>: <code>string</code></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="clear_container.0"></a> result&lt;_, <code>string</code>&gt;</li>
</ul>
<h4><a id="container_exists"></a><code>container-exists: func</code></h4>
<h5>Params</h5>
<ul>
<li><a id="container_exists.name"></a><code>name</code>: <code>string</code></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="container_exists.0"></a> result&lt;<code>bool</code>, <code>string</code>&gt;</li>
</ul>
<h4><a id="create_container"></a><code>create-container: func</code></h4>
<h5>Params</h5>
<ul>
<li><a id="create_container.name"></a><code>name</code>: <code>string</code></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="create_container.0"></a> result&lt;_, <code>string</code>&gt;</li>
</ul>
<h4><a id="delete_container"></a><code>delete-container: func</code></h4>
<h5>Params</h5>
<ul>
<li><a id="delete_container.name"></a><code>name</code>: <code>string</code></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="delete_container.0"></a> result&lt;_, <code>string</code>&gt;</li>
</ul>
<h4><a id="get_container_info"></a><code>get-container-info: func</code></h4>
<h5>Params</h5>
<ul>
<li><a id="get_container_info.name"></a><code>name</code>: <code>string</code></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="get_container_info.0"></a> result&lt;<a href="#container_metadata"><a href="#container_metadata"><code>container-metadata</code></a></a>, <code>string</code>&gt;</li>
</ul>
<h4><a id="list_container_objects"></a><code>list-container-objects: func</code></h4>
<h5>Params</h5>
<ul>
<li><a id="list_container_objects.name"></a><code>name</code>: <code>string</code></li>
<li><a id="list_container_objects.limit"></a><code>limit</code>: option&lt;<code>u64</code>&gt;</li>
<li><a id="list_container_objects.offset"></a><code>offset</code>: option&lt;<code>u64</code>&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="list_container_objects.0"></a> result&lt;stream&lt;<code>string</code>&gt;, <code>string</code>&gt;</li>
</ul>
<h4><a id="copy_object"></a><code>copy-object: func</code></h4>
<h5>Params</h5>
<ul>
<li><a id="copy_object.src"></a><code>src</code>: <a href="#object_id"><a href="#object_id"><code>object-id</code></a></a></li>
<li><a id="copy_object.dest"></a><code>dest</code>: <a href="#object_id"><a href="#object_id"><code>object-id</code></a></a></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="copy_object.0"></a> result&lt;_, <code>string</code>&gt;</li>
</ul>
<h4><a id="delete_object"></a><code>delete-object: func</code></h4>
<h5>Params</h5>
<ul>
<li><a id="delete_object.id"></a><code>id</code>: <a href="#object_id"><a href="#object_id"><code>object-id</code></a></a></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="delete_object.0"></a> result&lt;_, <code>string</code>&gt;</li>
</ul>
<h4><a id="delete_objects"></a><code>delete-objects: func</code></h4>
<h5>Params</h5>
<ul>
<li><a id="delete_objects.container"></a><code>container</code>: <code>string</code></li>
<li><a id="delete_objects.objects"></a><code>objects</code>: list&lt;<code>string</code>&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="delete_objects.0"></a> result&lt;_, <code>string</code>&gt;</li>
</ul>
<h4><a id="get_container_data"></a><code>get-container-data: func</code></h4>
<h5>Params</h5>
<ul>
<li><a id="get_container_data.id"></a><code>id</code>: <a href="#object_id"><a href="#object_id"><code>object-id</code></a></a></li>
<li><a id="get_container_data.start"></a><code>start</code>: <code>u64</code></li>
<li><a id="get_container_data.end"></a><code>end</code>: <code>u64</code></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="get_container_data.0"></a> result&lt;stream&lt;<code>u8</code>&gt;, <code>string</code>&gt;</li>
</ul>
<h4><a id="get_object_info"></a><code>get-object-info: func</code></h4>
<h5>Params</h5>
<ul>
<li><a id="get_object_info.id"></a><code>id</code>: <a href="#object_id"><a href="#object_id"><code>object-id</code></a></a></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="get_object_info.0"></a> result&lt;<a href="#object_metadata"><a href="#object_metadata"><code>object-metadata</code></a></a>, <code>string</code>&gt;</li>
</ul>
<h4><a id="has_object"></a><code>has-object: func</code></h4>
<h5>Params</h5>
<ul>
<li><a id="has_object.id"></a><code>id</code>: <a href="#object_id"><a href="#object_id"><code>object-id</code></a></a></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="has_object.0"></a> result&lt;<code>bool</code>, <code>string</code>&gt;</li>
</ul>
<h4><a id="move_object"></a><code>move-object: func</code></h4>
<h5>Params</h5>
<ul>
<li><a id="move_object.src"></a><code>src</code>: <a href="#object_id"><a href="#object_id"><code>object-id</code></a></a></li>
<li><a id="move_object.dest"></a><code>dest</code>: <a href="#object_id"><a href="#object_id"><code>object-id</code></a></a></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="move_object.0"></a> result&lt;_, <code>string</code>&gt;</li>
</ul>
<h4><a id="write_container_data"></a><code>write-container-data: func</code></h4>
<h5>Params</h5>
<ul>
<li><a id="write_container_data.id"></a><code>id</code>: <a href="#object_id"><a href="#object_id"><code>object-id</code></a></a></li>
<li><a id="write_container_data.data"></a><code>data</code>: stream&lt;<code>u8</code>&gt;</li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="write_container_data.0"></a> result&lt;_, <code>string</code>&gt;</li>
</ul>
<h2><a id="wasmcloud_messaging_handler_0_2_0"></a>Export interface wasmcloud:messaging/handler@0.2.0</h2>
<hr />
<h3>Types</h3>
<h4><a id="broker_message"></a><code>type broker-message</code></h4>
<p><a href="#broker_message"><a href="#broker_message"><code>broker-message</code></a></a></p>
<p>
----
<h3>Functions</h3>
<h4><a id="handle_message"></a><code>handle-message: func</code></h4>
<p>Callback handled to invoke a function when a message is received from a subscription</p>
<h5>Params</h5>
<ul>
<li><a id="handle_message.msg"></a><code>msg</code>: <a href="#broker_message"><a href="#broker_message"><code>broker-message</code></a></a></li>
</ul>
<h5>Return values</h5>
<ul>
<li><a id="handle_message.0"></a> result&lt;_, <code>string</code>&gt;</li>
</ul>
