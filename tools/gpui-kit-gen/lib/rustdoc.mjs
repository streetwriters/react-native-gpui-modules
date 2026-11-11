import { readFileSync } from 'node:fs';

export const SUPPORTED_FORMAT = 60;

export class Docs {
  constructor(files) {
    this.crates = files.map(file => {
      const json = JSON.parse(readFileSync(file, 'utf8'));
      if (json.format_version !== SUPPORTED_FORMAT) {
        throw new Error(
          `${file}: rustdoc format ${json.format_version}, the generator reads ${SUPPORTED_FORMAT}`,
        );
      }
      return json;
    });
    this.byPath = new Map();
    this.owner = new Map();
    for (const [index, crate] of this.crates.entries()) {
      for (const [id, entry] of Object.entries(crate.paths)) {
        if (entry.crate_id !== 0) continue;
        const path = entry.path.join('::');
        if (!this.byPath.has(path)) this.byPath.set(path, { index, id, kind: entry.kind });
      }
    }
  }

  item(index, id) {
    return this.crates[index].index[String(id)];
  }

  find(path) {
    const hit = this.byPath.get(path);
    if (!hit) return null;
    const item = this.item(hit.index, hit.id);
    return item ? { ...hit, item } : null;
  }

  pathOf(index, id) {
    const entry = this.crates[index].paths[String(id)];
    return entry ? entry.path.join('::') : null;
  }

  publicPath(index, id) {
    if (!this.publicPaths) this.publicPaths = new Map();
    if (!this.publicPaths.has(index)) this.publicPaths.set(index, this.buildPublicPaths(index));
    return this.publicPaths.get(index).get(String(id)) ?? null;
  }

  buildPublicPaths(index) {
    const crate = this.crates[index];
    const out = new Map();
    const crateName = crate.index[String(crate.root)].name;
    const record = (id, path) => {
      const key = String(id);
      const current = out.get(key);
      if (!current || path.length < current.length || (path.length === current.length && path < current)) {
        out.set(key, path);
      }
    };
    const seen = new Set();
    const visit = (moduleId, prefix) => {
      const key = `${moduleId}@${prefix}`;
      if (seen.has(key)) return;
      seen.add(key);
      const module = crate.index[String(moduleId)];
      if (!module?.inner.module) return;
      for (const childId of module.inner.module.items) {
        const child = crate.index[String(childId)];
        if (!child) continue;
        const isPublic = child.visibility === 'public' || child.inner.use;
        if (!isPublic) continue;
        if (child.inner.use) {
          const use = child.inner.use;
          if (use.id == null) continue;
          const target = crate.index[String(use.id)];
          if (use.is_glob) {
            if (target?.inner.module) visit(use.id, prefix);
            else if (target?.inner.enum) continue;
          } else {
            record(use.id, `${prefix}::${use.name}`);
            if (target?.inner.module) visit(use.id, `${prefix}::${use.name}`);
          }
        } else if (child.name) {
          record(childId, `${prefix}::${child.name}`);
          if (child.inner.module) visit(childId, `${prefix}::${child.name}`);
        }
      }
    };
    visit(crate.root, crateName);
    return out;
  }

  implsOf(index, struct) {
    return struct.impls.map(id => this.item(index, id)).filter(Boolean);
  }
}

export function typeName(type) {
  if (!type) return 'unit';
  if (type.primitive) return type.primitive;
  if (type.generic) return type.generic;
  if (type.resolved_path) return type.resolved_path.path;
  if (type.borrowed_ref) return `&${type.borrowed_ref.is_mutable ? 'mut ' : ''}${typeName(type.borrowed_ref.type)}`;
  if (type.tuple) return `(${type.tuple.map(typeName).join(', ')})`;
  if (type.slice) return `[${typeName(type.slice)}]`;
  if (type.array) return `[${typeName(type.array.type)}; N]`;
  if (type.impl_trait) {
    return `impl ${type.impl_trait.map(bound => (bound.trait_bound ? typeName({ resolved_path: bound.trait_bound.trait }) : "'lt")).join(' + ')}`;
  }
  if (type.dyn_trait) return `dyn ${type.dyn_trait.traits.map(t => t.trait.path).join(' + ')}`;
  if (type.function_pointer) return 'fn(..)';
  if (type.qualified_path) return `${type.qualified_path.name}`;
  return Object.keys(type)[0];
}

export function genericArgs(path) {
  const args = path?.args?.angle_bracketed?.args ?? [];
  return args.filter(a => a.type).map(a => a.type);
}

export function resolveStruct(docs, hit) {
  const inner = hit.item.inner;
  if (inner.struct || inner.enum) return { index: hit.index, item: hit.item, aliasArgs: null, publicIndex: hit.index, publicId: hit.id };
  if (inner.type_alias) {
    const resolved = inner.type_alias.type?.resolved_path;
    if (!resolved) throw new Error(`${hit.item.name}: alias does not name a type`);
    const target = docs.item(hit.index, resolved.id);
    if (!target?.inner.struct && !target?.inner.enum) throw new Error(`${hit.item.name}: alias target is not a struct`);
    const aliasArgs = (resolved.args?.angle_bracketed?.args ?? [])
      .filter(a => a.type)
      .map(a => ({ id: a.type.resolved_path?.id ?? null, path: a.type.resolved_path ? docs.pathOf(hit.index, a.type.resolved_path.id) : null, generic: a.type.generic ?? null }));
    return { index: hit.index, item: target, aliasArgs, publicIndex: hit.index, publicId: hit.id };
  }
  throw new Error(`${hit.item.name}: not a struct, enum or alias`);
}

function implementsTrait(docs, index, typeItem, traitPath) {
  const inner = typeItem?.inner.struct ?? typeItem?.inner.enum;
  if (!inner) return false;
  return inner.impls.some(id => {
    const impl = docs.item(index, id)?.inner.impl;
    if (!impl?.trait) return false;
    const path = docs.pathOf(index, impl.trait.id) ?? impl.trait.path;
    return path === traitPath || path.split('::').pop() === traitPath.split('::').pop();
  });
}

export function implApplies(docs, index, impl, struct) {
  if (!struct.aliasArgs || struct.aliasArgs.length === 0) return true;
  const generics = impl.inner.impl.generics?.params ?? [];
  const forArgs = impl.inner.impl.for?.resolved_path?.args?.angle_bracketed?.args?.filter(a => a.type) ?? [];
  if (forArgs.length === 0) return true;
  return struct.aliasArgs.every((alias, position) => {
    const arg = forArgs[position]?.type;
    if (!arg) return true;
    if (arg.generic) {
      const param = generics.find(p => p.name === arg.generic);
      const bounds = param?.kind?.type?.bounds ?? [];
      const aliasItem = alias.id != null ? docs.item(index, alias.id) : null;
      return bounds.every(bound => {
        const traitRef = bound.trait_bound?.trait;
        if (!traitRef) return true;
        const traitPath = docs.pathOf(index, traitRef.id) ?? traitRef.path;
        if (/^(Sized|Send|Sync|Copy|Clone|Default|Debug|'static)$/.test(traitPath.split('::').pop())) return true;
        return implementsTrait(docs, index, aliasItem, traitPath);
      });
    }
    const path = arg.resolved_path ? docs.pathOf(index, arg.resolved_path.id) : null;
    if (!path || !alias.path) return false;
    return path === alias.path || path.split('::').pop() === alias.path.split('::').pop();
  });
}
