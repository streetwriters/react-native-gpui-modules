#!/usr/bin/env node
// Proves the packed modules work for a consumer: creates a fresh app outside the
// repository with the published react-native-gpui CLI, installs every module
// that has a Rust crate from its tarball, builds a debug desktop binary and
// checks that each crate was linked from the installed core.
//
//   node scripts/ci/clean-install.mjs [--dir <dir>] [--cli <version>]
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

function option(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

function run(command, args, options = {}) {
  process.stderr.write(`\n$ ${command} ${args.join(' ')}\n`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32' && command === 'npm',
    ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`${command} exited with ${result.status}`);
}

const appDir = path.resolve(
  option(
    '--dir',
    path.join(process.env.RUNNER_TEMP ?? os.tmpdir(), 'rn-gpui-modules-clean'),
  ),
);
if (appDir.startsWith(repoRoot + path.sep)) {
  throw new Error('refusing to install inside the repository');
}
const cliVersion = option('--cli', 'latest');
const tarballs = path.join(appDir, 'tarballs');
fs.rmSync(appDir, { recursive: true, force: true });
fs.mkdirSync(tarballs, { recursive: true });

const rustModules = [];
for (const entry of fs.readdirSync(path.join(repoRoot, 'modules')).sort()) {
  const dir = path.join(repoRoot, 'modules', entry);
  const config = path.join(dir, 'react-native.config.js');
  if (
    !fs.existsSync(config) ||
    !/crate\s*:/u.test(fs.readFileSync(config, 'utf8'))
  )
    continue;
  const manifest = JSON.parse(
    fs.readFileSync(path.join(dir, 'package.json'), 'utf8'),
  );
  const packed = JSON.parse(
    execFileSync('npm', ['pack', '--json', '--pack-destination', tarballs], {
      cwd: dir,
      encoding: 'utf8',
      shell: process.platform === 'win32',
    }),
  );
  rustModules.push({
    name: manifest.name,
    peers: manifest.peerDependencies ?? {},
    tarball: path.join(tarballs, packed[0].filename),
  });
}

run(
  'npm',
  [
    'install',
    '--no-package-lock',
    '--no-save',
    `@react-native-gpui/cli@${cliVersion}`,
  ],
  {
    cwd: appDir,
  },
);
const cliBin = path.join(
  appDir,
  'node_modules/@react-native-gpui/cli/bin/react-native-gpui.js',
);
run(process.execPath, [cliBin, 'init', 'SmokeApp', '--directory', 'SmokeApp'], {
  cwd: appDir,
});

const projectRoot = path.join(appDir, 'SmokeApp');
const manifestPath = path.join(projectRoot, 'package.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const lock = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'package-lock.json'), 'utf8'),
);
for (const module of rustModules) {
  manifest.dependencies[module.name] = `file:${module.tarball}`;
  for (const peer of Object.keys(module.peers)) {
    if (peer === 'react-native' || manifest.dependencies[peer] !== undefined)
      continue;
    const version = lock.packages?.[`node_modules/${peer}`]?.version;
    if (version === undefined)
      throw new Error(`no resolved version for ${peer}`);
    manifest.dependencies[peer] = version;
  }
}
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
run('npm', ['install'], { cwd: projectRoot });
run('npx', ['react-native', 'run-desktop', '--no-launch'], {
  cwd: projectRoot,
  shell: process.platform === 'win32',
});

const record = JSON.parse(
  fs.readFileSync(
    path.join(projectRoot, 'desktop/autolink/autolink.json'),
    'utf8',
  ),
);
const nodeModules = fs.realpathSync(path.join(projectRoot, 'node_modules'));
for (const module of rustModules) {
  const entry = (record.rustCrates ?? []).find(
    crate => crate.dependencyName === module.name,
  );
  if (entry === undefined)
    throw new Error(`autolink recorded no Rust crate for ${module.name}`);
  const resolved = fs.realpathSync(path.resolve(entry.cargoPath));
  if (!resolved.startsWith(nodeModules + path.sep)) {
    throw new Error(
      `${module.name} links its crate from ${resolved}, outside this app's node_modules`,
    );
  }
  process.stderr.write(`linked ${module.name} from ${resolved}\n`);
}
const tree = execFileSync(
  'cargo',
  ['tree', '--manifest-path', 'desktop/Cargo.toml', '-i', 'rn-gpui-module'],
  { cwd: projectRoot, encoding: 'utf8' },
);
const coreRoot = path.join(nodeModules, '@react-native-gpui', 'core');
if (!tree.includes(coreRoot)) {
  throw new Error(
    `rn-gpui-module does not resolve under ${coreRoot}:\n${tree}`,
  );
}
