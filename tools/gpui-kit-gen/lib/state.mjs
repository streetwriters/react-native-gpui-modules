import { implApplies, resolveStruct, typeName } from './rustdoc.mjs';

function isMutRef(type, name) {
  const ref = type?.borrowed_ref;
  if (!ref) return false;
  if (
    name &&
    typeName(ref.type) !== name &&
    typeName(ref.type).split('::').pop() !== name
  )
    return false;
  return true;
}

export function extractState(docs, path) {
  const hit = docs.find(path);
  if (!hit) throw new Error(`${path} not found in rustdoc`);
  const resolved = resolveStruct(docs, hit);
  const struct = resolved.item.inner.struct;
  const methods = [];
  const eventEnums = [];
  for (const impl of docs.implsOf(hit.index, struct)) {
    if (!implApplies(docs, hit.index, impl, resolved)) continue;
    const inner = impl.inner.impl;
    if (inner.trait) {
      if (inner.trait.path.endsWith('EventEmitter')) {
        const arg =
          inner.trait.args?.angle_bracketed?.args?.[0]?.type?.resolved_path;
        if (arg) eventEnums.push(docs.pathOf(hit.index, arg.id) ?? arg.path);
      }
      continue;
    }
    for (const id of inner.items) {
      const item = docs.item(hit.index, id);
      const fn = item?.inner.function;
      if (!fn || item.visibility !== 'public') continue;
      const inputs = fn.sig.inputs;
      const first = inputs[0];
      const selfKind =
        first?.[0] !== 'self'
          ? 'none'
          : first[1]?.borrowed_ref
            ? first[1].borrowed_ref.is_mutable
              ? 'mut'
              : 'ref'
            : 'value';
      const rest = selfKind === 'none' ? inputs : inputs.slice(1);
      const data = [];
      let needsWindow = false;
      let needsCx = false;
      for (const [name, type] of rest) {
        const ref = type?.borrowed_ref;
        const target = ref ? typeName(ref.type).split('::').pop() : '';
        if (ref && target === 'Window') needsWindow = true;
        else if (ref && /^Context/.test(target)) needsCx = true;
        else if (ref && target === 'App') needsCx = true;
        else data.push({ name, type });
      }
      methods.push({
        name: item.name,
        selfKind,
        data,
        needsWindow,
        needsCx,
        output: fn.sig.output,
      });
    }
  }
  return {
    path,
    publicPath: docs.publicPath(hit.index, hit.id) ?? path,
    index: hit.index,
    methods,
    eventEnums,
    resolved,
  };
}

export function eventVariants(docs, enumPath) {
  const hit = docs.find(enumPath);
  if (!hit?.item.inner.enum) return [];
  return hit.item.inner.enum.variants.map(id => {
    const variant = docs.item(hit.index, id);
    const kind = variant.inner.variant.kind;
    const fields =
      kind?.struct?.fields?.map(f => {
        const field = docs.item(hit.index, f);
        return { name: field.name, type: field.inner.struct_field };
      }) ?? [];
    return { name: variant.name, plain: kind === 'plain', fields };
  });
}
