---
title: "Clippy warnings"
draft: false
---

## Clippy warning on `&String` parameters

If your `.smithy` model has an operation whose input parameter is a 'String', clippy may generate the following warning:
```
warning: writing `&String` instead of `&str` involves a new object where a slice will do
```

That's incorrect for our use case (try changing it and you'll see that change `&String` to `&str` doesn't work). To avoid this warning, add `#![allow(clippy::ptr_arg)]` as the first line in your interface project's `src/lib.rs`
