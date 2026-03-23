<h1><a id="unversioned_logging"></a>World unversioned-logging</h1>
<ul>
<li>Exports:
<ul>
<li>interface <a href="#wasi_logging_logging"><code>wasi:logging/logging</code></a></li>
</ul>
</li>
</ul>
<h2><a id="wasi_logging_logging"></a>Export interface wasi:logging/logging</h2>
<hr />
<h3>Types</h3>
<h4><a id="level"></a><code>enum level</code></h4>
<p>A log level, describing a kind of message.</p>
<h5>Enum Cases</h5>
<ul>
<li>
<p><a id="level.trace"></a><code>trace</code></p>
<p>Describes messages about the values of variables and the flow of
control within a program.
</li>
<li>
<p><a id="level.debug"></a><code>debug</code></p>
<p>Describes messages likely to be of interest to someone debugging a
program.
</li>
<li>
<p><a id="level.info"></a><code>info</code></p>
<p>Describes messages likely to be of interest to someone monitoring a
program.
</li>
<li>
<p><a id="level.warn"></a><code>warn</code></p>
<p>Describes messages indicating hazardous situations.
</li>
<li>
<p><a id="level.error"></a><code>error</code></p>
<p>Describes messages indicating serious errors.
</li>
<li>
<p><a id="level.critical"></a><code>critical</code></p>
<p>Describes messages indicating fatal errors.
</li>
</ul>
<hr />
<h3>Functions</h3>
<h4><a id="log"></a><code>log: func</code></h4>
<p>Emit a log message.</p>
<p>A log message has a <a href="#level"><code>level</code></a> describing what kind of message is being
sent, a context, which is an uninterpreted string meant to help
consumers group similar messages, and a string containing the message
text.</p>
<h5>Params</h5>
<ul>
<li><a id="log.level"></a><a href="#level"><code>level</code></a>: <a href="#level"><a href="#level"><code>level</code></a></a></li>
<li><a id="log.context"></a><code>context</code>: <code>string</code></li>
<li><a id="log.message"></a><code>message</code>: <code>string</code></li>
</ul>
