import { genericArgs, implApplies, resolveStruct, typeName } from './rustdoc.mjs';

function isSelfValue(input) {
  return input[0] === 'self' && input[1]?.generic === 'Self';
}

function fnInfo(item) {
  const fn = item.inner.function;
  if (!fn) return null;
  const inputs = fn.sig.inputs;
  const output = fn.sig.output;
  return {
    name: item.name,
    inputs,
    output,
    selfValue: inputs.length > 0 && isSelfValue(inputs[0]),
    selfRef: inputs.length > 0 && inputs[0][0] === 'self' && !!inputs[0][1]?.borrowed_ref,
    returnsSelf: output?.generic === 'Self',
    docs: item.docs ?? '',
    generics: fn.generics,
  };
}

export function closureOf(type) {
  const bound = type?.impl_trait?.find(b => b.trait_bound)?.trait_bound?.trait;
  const args = bound?.args?.parenthesized;
  if (!args || !/^(Fn|FnMut|FnOnce)$/.test(bound.path)) return null;
  return { inputs: args.inputs, output: args.output };
}

export function extractComponent(docs, path) {
  const hit = docs.find(path);
  if (!hit) throw new Error(`${path} not found in rustdoc`);
  const resolved = resolveStruct(docs, hit);
  const struct = resolved.item.inner.struct ?? resolved.item.inner.enum;
  const component = {
    path,
    name: hit.item.name,
    resolved,
    docs: hit.item.docs ?? '',
    constructors: [],
    builders: [],
    events: [],
    others: [],
    traits: [],
    traitBuilders: [],
  };
  for (const impl of docs.implsOf(hit.index, struct)) {
    const inner = impl.inner.impl;
    if (inner.is_synthetic || inner.blanket_impl) continue;
    if (!implApplies(docs, hit.index, impl, resolved)) continue;
    if (!inner.trait) {
      for (const id of inner.items) {
        const item = docs.item(hit.index, id);
        const info = item && fnInfo(item);
        if (!info || item.visibility !== 'public') continue;
        if (!info.inputs.some(i => i[0] === 'self') && info.output && (info.output.generic === 'Self' || typeName(info.output) === component.name)) {
          component.constructors.push(info);
        } else if (info.selfValue && info.returnsSelf) {
          const last = info.inputs[info.inputs.length - 1];
          if (closureOf(last?.[1])) component.events.push(info);
          else component.builders.push(info);
        } else {
          component.others.push(info);
        }
      }
    } else {
      const traitPath = docs.pathOf(hit.index, inner.trait.id) ?? inner.trait.path;
      component.traits.push(traitPath);
      const traitHit = docs.find(traitPath);
      if (!traitHit || !traitHit.item.inner.trait) continue;
      for (const id of traitHit.item.inner.trait.items) {
        const item = docs.item(traitHit.index, id);
        const info = item && fnInfo(item);
        if (info && info.selfValue && info.returnsSelf) {
          component.traitBuilders.push({ ...info, trait: traitPath });
        }
      }
    }
  }
  return component;
}

export function describeParam(type) {
  const closure = closureOf(type);
  if (closure) {
    return `Fn(${closure.inputs.map(typeName).join(', ')})`;
  }
  const inner = type?.impl_trait?.[0]?.trait_bound?.trait;
  if (inner) return `impl ${inner.path}<${genericArgs(inner).map(typeName).join(', ')}>`;
  return typeName(type);
}
