---
title: "Error messages"
draft: false
---

Error messages from the smithy model parser, invoked by `build.rs` in Rust project, can be very long and detailed, sometimes more verbose than you need.

Errors from `wash lint` or `wash validate` are usually more specific.

For build errors, look for the part of the message containing

```
line_col: Pos[L,C]
```

The numbers L and C are the line number and column number of the syntax error. Shortly after that there should be a `line:` showing the line of the input file containing the error.
