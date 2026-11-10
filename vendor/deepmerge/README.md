# Local deepmerge security patch

This is the published `deepmerge@4.3.1` CommonJS bundle and type definitions,
with its MIT license retained. The root `deepmerge` file dependency anchors its
location; the `$deepmerge` npm override makes both ReactPlayer and SVGR use it.

[GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4)
has no patched upstream release as of 2026-11-09. The original `mergeObject`
assignments can invoke the inherited `__proto__` setter when copying an own
`__proto__` key from the target, or from a source into a null-prototype target.
The returned object's prototype can consequently contain attacker-controlled
properties.

The only functional change is to define the three destination writes as own,
enumerable, writable, configurable data properties. This preserves merge
behavior while preventing inherited setters from changing the prototype.
The bundled `is-mergeable-object` implementation is unchanged.

Run `npm run test:dependency-security` to test the actual dependency resolution
from both consumers, prototype-poisoning cases, and merge compatibility.
Remove this directory, its Dockerfile copy, and the root override when an
upstream release fixes the advisory and passes those regressions.
