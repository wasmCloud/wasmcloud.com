---
title: "Single-member structures"
draft: false
---

A function is modeled as an operation, with an optional `input` type 
for its parameters, and an optional `output` type for its return value.
If either input or output type is a structure containing one member, it
is often preferred to simplify the declaration and api to use the value directly,
without the structure wrapper. For example, instead of 

```text
/// count the number of values matching a query string
operation Count {
    input: String,
    output: CountResponse,
}

structure CountResponse {
    value: U32,
}
```

Use
```text
/// count the number of values matching a query string
operation Count {
    input: String,
    output: U32,
}
```

One reason you might still prefer to use a structure is if you expect to add fields to those structures in the future. For outputs, adding a field to the output would be a non-breaking api change. For inputs, addition of fields can be a non-breaking change if the structure has a default constructor and if the field has a default value. Using input and output structures can help provide a smooth upgrade path to users of your api.

Another reason you may need a structure is if the value is optional (in Rust, `Option<T>`). Since operation input and output can't be declared optional, you'd have to make the optional value a field of a structure.

If neither of those cases apply, structures with one member can be replaced with the member.





