import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const require = createRequire(import.meta.url);
const playerRequire = createRequire(require.resolve('react-player'));
const svgRequire = createRequire(require.resolve('@svgr/plugin-svgo'));

for (const [consumer, consumerRequire] of [
  ['ReactPlayer', playerRequire],
  ['SVGR', svgRequire],
]) {
  const merge = consumerRequire('deepmerge');

  test(`${consumer}: merging an own __proto__ key cannot poison the result`, () => {
    const payload = () => JSON.parse('{"__proto__":{"polluted":true}}');
    const inputs = [
      [payload(), {}],
      [Object.create(null), payload()],
      [payload(), payload()],
      [{ nested: payload() }, { nested: payload() }],
    ];
    for (const [target, source] of inputs) {
      const result = merge(target, source);
      const merged = result.nested ?? result;
      assert.equal(Object.getPrototypeOf(merged), Object.prototype);
      assert.equal(merged.polluted, undefined);
      assert.equal({}.polluted, undefined);
    }
  });

  test(`${consumer}: preserve configuration merging and array overrides`, () => {
    const target = { youtube: { playerVars: { controls: 1 } }, files: ['a'] };
    const source = { youtube: { playerVars: { autoplay: 1 } }, files: ['b'] };
    const merged = merge.all([target, source], { arrayMerge: (_, next) => next });
    assert.deepEqual(merged, {
      youtube: { playerVars: { controls: 1, autoplay: 1 } }, files: ['b'],
    });
    assert.deepEqual(target.files, ['a']);
    assert.deepEqual(merge({ files: ['a'] }, { files: ['b'] }).files, ['a', 'b']);
    const date = new Date(0);
    const pattern = /test/g;
    const symbol = Symbol('config');
    assert.deepEqual(merge({}, { date, pattern, [symbol]: 42 }), {
      date, pattern, [symbol]: 42,
    });
  });
}

test('Tinypool ignores inherited worker arguments and task filenames', { timeout: 10000 }, async () => {
  const coreRequire = createRequire(require.resolve('@docusaurus/core/package.json'));
  const { default: Tinypool } = await import(pathToFileURL(coreRequire.resolve('tinypool')));
  const directory = await mkdtemp(path.join(tmpdir(), 'wasmcloud-worker-test-'));
  const worker = path.join(directory, 'worker.mjs');
  await writeFile(worker, 'export default value => value * 2;\n');
  let pool;
  try {
    Object.prototype.execArgv = ['--invalid-inherited-worker-option'];
    pool = new Tinypool({ filename: worker, minThreads: 1, maxThreads: 1 });
    delete Object.prototype.execArgv;
    Object.prototype.filename = path.join(directory, 'unexpected-worker.mjs');
    assert.equal(await pool.run(21, {}), 42);
  } finally {
    delete Object.prototype.execArgv;
    delete Object.prototype.filename;
    await pool?.destroy();
    await rm(directory, { recursive: true, force: true });
  }
});

test('serialization rejects executable Date output and sanitizes RegExp flags', () => {
  const pluginRequire = createRequire(require.resolve('copy-webpack-plugin'));
  const serialize = pluginRequire('serialize-javascript');
  const date = new Date(0);
  date.toISOString = () => '\");globalThis.compromised=true;//';
  assert.throws(() => serialize({ date }), TypeError);
  const regex = /x/;
  Object.defineProperty(regex, 'flags', { value: '\")+(()=>{throw 42})()+new RegExp(\"x\",\"' });
  const output = serialize({ regex });
  assert.doesNotThrow(() => runInNewContext(`(${output})`));
});

test('SockJS retains the CommonJS UUID API and rejects undersized v5 buffers', () => {
  const sockRequire = createRequire(require.resolve('sockjs'));
  const { v4, v5, validate } = sockRequire('uuid');
  assert.equal(validate(v4()), true);
  assert.throws(() => v5('test', v5.DNS, new Uint8Array(8)), RangeError);
});

test('the LLM plugin keeps the minimatch API used to select documentation', () => {
  const llmsRequire = createRequire(require.resolve('docusaurus-plugin-llms'));
  const { minimatch } = llmsRequire('minimatch');
  assert.equal(minimatch('/docs/installation/', '/docs/**'), true);
  assert.equal(minimatch('/blog/post/', '/docs/**'), false);
});
