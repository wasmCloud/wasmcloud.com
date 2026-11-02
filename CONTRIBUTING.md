# Contributing to wasmcloud.com

Thanks for helping improve the wasmCloud website and documentation. wasmCloud is a CNCF project;
the [project governance](https://github.com/wasmCloud/wasmCloud/blob/main/GOVERNANCE.md) and
[code of conduct](https://github.com/cncf/foundation/blob/main/code-of-conduct.md) apply here.

## Reporting Problems

Report errors in the docs or the site as [GitHub issues](https://github.com/wasmCloud/wasmcloud.com/issues).
Report problems with wasmCloud itself in [wasmCloud/wasmCloud](https://github.com/wasmCloud/wasmCloud/issues).

Don't report security vulnerabilities as issues. Follow the
[security policy](https://github.com/wasmCloud/wasmcloud.com/security/policy) to report them privately.

## Making Changes

The [Documentation Contribution Guide](https://wasmcloud.com/docs/contributing/documentation) covers
local setup, the style guide, MDX conventions and diagram assets in detail. In short:

1. Run the site locally as the [README](README.md#running-the-site-locally) describes, and check
   that `npm run build` succeeds.
2. Edit the current docs under `docs/`. `versioned_docs/` holds the docs for earlier releases.
3. Follow the style rules in `writing-styles/`, which [Vale](https://vale.sh) reads through
   `.vale.ini`.
4. Sign off every commit with `git commit -s` to certify the
   [Developer Certificate of Origin](https://developercertificate.org/).
5. Open a pull request against `main`. CI builds the site and validates its structured data, and
   Netlify posts a deploy preview.

[`@wasmCloud/docs-maintainers`](MAINTAINERS.md) review every change, as set in
[`CODEOWNERS`](.github/CODEOWNERS).

## Code Scanning

[CodeQL](.github/workflows/codeql.yml) analyzes the site's TypeScript and JavaScript and the GitHub
Actions workflows on every pull request, on every push to `main`, and weekly. Its alerts appear in
the repository's Security tab.

- A pull request that adds a high or critical severity CodeQL alert is blocked from merging until
  the alert is fixed or dismissed with a stated reason.
- Alerts open on `main` must be fixed, or dismissed with a stated reason, within 7 days for
  critical, 14 days for high and 90 days for medium severity. Low severity alerts are fixed on a
  best-effort basis.

## Licensing

Content is licensed under [CC-BY-4.0](LICENSE) and code under [Apache-2.0](LICENSE-CODE).
