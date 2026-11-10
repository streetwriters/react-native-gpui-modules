import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  applyPatchBlock,
  managedPatchEntries,
} from '@react-native-gpui/cli/src/autolink.js';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const env = { ...process.env };

// The crates are read from autolink's record rather than listed here, so a new
// module's tests run without editing this script.
const autolinkRecord = path.join(
  repoRoot,
  'example/desktop/autolink/autolink.json',
);
if (!fs.existsSync(autolinkRecord)) {
  throw new Error(
    `${autolinkRecord} is missing; run \`npx react-native-gpui autolink\` in example first`,
  );
}
const record = JSON.parse(fs.readFileSync(autolinkRecord, 'utf8'));

/// Crates whose tests cannot run, each with the reason, printed on every run.
const SKIPPED = new Map([['rn-gpui-webview', 'it has no tests']]);

const moduleCrates = (record.rustCrates ?? [])
  .filter(crate => {
    const resolved = fs.realpathSync(path.resolve(crate.cargoPath ?? ''));
    return resolved.startsWith(path.join(repoRoot, 'modules') + path.sep);
  })
  .map(crate => crate.crateName)
  .filter(name => typeof name === 'string')
  .sort();

// A crate that declares a `[workspace]` of its own is tested from its own
// directory, and has to be: Cargo refuses to test a package with dev-dependencies
// unless it is a workspace member, and from the tester's manifest it is not one.
// Such a crate is its own root, so it carries the patch block that points core at
// this checkout; the block is checked in beside the crate.
const isOwnWorkspace = name => {
  const entry = (record.rustCrates ?? []).find(
    crate => crate.crateName === name,
  );
  const manifest = path.join(
    path.resolve(entry?.cargoPath ?? ''),
    'Cargo.toml',
  );
  return (
    fs.existsSync(manifest) &&
    /^\[workspace\]/mu.test(fs.readFileSync(manifest, 'utf8'))
  );
};

const ownWorkspace = moduleCrates.filter(
  name => !SKIPPED.has(name) && isOwnWorkspace(name),
);
const fromTester = moduleCrates.filter(
  name => !SKIPPED.has(name) && !isOwnWorkspace(name),
);
const toRun = [...fromTester, ...ownWorkspace];
process.stderr.write(
  `module crates: ${toRun.length > 0 ? toRun.join(', ') : 'none'}\n`,
);
for (const name of moduleCrates.filter(candidate => SKIPPED.has(candidate))) {
  process.stderr.write(`skipped ${name}: ${SKIPPED.get(name)}\n`);
}

const moduleRuns = [];
if (fromTester.length > 0) {
  const args = ['test', '--manifest-path', 'example/desktop/Cargo.toml'];
  for (const name of fromTester) args.push('-p', name);
  moduleRuns.push(
    spawnSync('cargo', args, { cwd: repoRoot, env, stdio: 'inherit' }),
  );
}
// A crate that is its own workspace root needs the `[patch.crates-io]` table in
// its own manifest, because Cargo honours `[patch]` only at the root and this
// crate is not a member of the app's workspace. The block is generated here from
// core's manifest rather than checked in: checked in, it would pin gpui at
// whatever revision happened to be current when it was written, and the module's
// tests would quietly build against an older gpui than the app ships — the drift
// this branch exists to remove.
for (const name of ownWorkspace) {
  const entry = (record.rustCrates ?? []).find(
    crate => crate.crateName === name,
  );
  const crateRoot = path.resolve(entry.cargoPath);
  const manifestPath = path.join(crateRoot, 'Cargo.toml');
  const raw = fs.readFileSync(manifestPath, 'utf8');
  // The file is committed with LF, and a Windows checkout with `core.autocrlf`
  // reads back CRLF. Compared without normalising, every Windows run would report
  // the block stale and rewrite a file whose content is already correct — the
  // same mistake autolink's own readers were fixed for.
  const newline = raw.includes('\r\n') ? '\r\n' : '\n';
  const before = raw.replace(/\r\n/gu, '\n');
  const updated = applyPatchBlock(
    before,
    manifestPath,
    managedPatchEntries(
      path.join(repoRoot, 'node_modules/@react-native-gpui/core'),
      crateRoot,
    ),
  );
  if (updated !== before) {
    // Written and then failed: a stale block is a mistake that should be
    // corrected in the same commit as whichever pin change caused it, not
    // silently repaired on every test run. The file's own newline convention is
    // restored, so a Windows checkout is not rewritten with LF.
    fs.writeFileSync(
      manifestPath,
      newline === '\r\n' ? updated.replace(/\n/gu, '\r\n') : updated,
    );
    throw new Error(
      `${manifestPath} had a stale [patch.crates-io] block and has been rewritten. ` +
        "Commit the result: it must match core's gpui pin.",
    );
  }
}

for (const name of ownWorkspace) {
  const entry = (record.rustCrates ?? []).find(
    crate => crate.crateName === name,
  );
  moduleRuns.push(
    spawnSync('cargo', ['test'], {
      cwd: path.resolve(entry.cargoPath),
      env,
      stdio: 'inherit',
    }),
  );
}
for (const run of moduleRuns) {
  if (run.error) throw run.error;
}

// Every run must pass, and `??` is the wrong operator to say so: a passing run
// reports status 0, which is not nullish, so `0 ?? failure` is 0 and a failing
// later run would go unnoticed. `status` is null when a run was killed by a
// signal, which counts as a failure rather than as nothing to report.
const exitStatus = run => run.status ?? 1;
process.exitCode = moduleRuns.reduce(
  (worst, run) => worst || exitStatus(run),
  0,
);
