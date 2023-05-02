---
title: "Lint and validate checks"
draft: false
---

The lint and validation checks are very useful for finding problems in smithy model files. They will detect syntax errors, missing dependencies, and style errors.

To run lint checks, cd to the folder containing `codegen.toml`, and type

```
wash lint
```

To check the model against validation rules, type

```
wash validate
```

See [errors](./error-messages/) for information on understanding errors from these commands.
