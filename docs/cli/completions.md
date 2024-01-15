---
title: "wash completions"
draft: false
sidebar_position: 6
description: "wash completions command reference"
--- 

Shell completions for wash commands can be enabled with the use of `wash completions`. This feature will help you to easily navigate the CLI interface as it will recommend auto-completions for wash subcommands. Currently, shell completions can be generated for the following supported shell types:

- `zsh`
- `bash`
- `fish`
- `powershell`

Instructions for setting up completions for specific shells can be found after running the command or by visiting [this URL](https://github.com/wasmCloud/wasmCloud/blob/main/crates/wash-cli/Completions.md).

### Usage

```
wash commpletions zsh
wash commpletions bash
wash commpletions fish
wash commpletions powershell
```

### Options

`--dir` (Alias `-d`) Output directory for the generated completions (Defaults to current directory)

`--output` (Alias `-o`) Specify output format (text or json) [default: text]

`--experimental` Whether or not to enable experimental features [env: WASH_EXPERIMENTAL=]