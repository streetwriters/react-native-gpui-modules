import { closureOf } from './extract.mjs';
import { genericArgs, typeName } from './rustdoc.mjs';

const INTS = new Set([
  'i8',
  'i16',
  'i32',
  'u8',
  'u16',
  'u32',
  'isize',
  'usize',
  'i64',
  'u64',
]);
const FLOATS = new Set(['f32', 'f64']);

function unwrapInto(type) {
  const bound = type?.impl_trait?.find(b => b.trait_bound)?.trait_bound?.trait;
  if (bound && /^(Into|AsRef)$/.test(bound.path)) {
    return genericArgs(bound)[0] ?? null;
  }
  return type;
}

export function camel(name) {
  return name.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

export function pascal(name) {
  const value = camel(name);
  return value[0].toUpperCase() + value.slice(1);
}

export function kebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

export function enumInfo(ctx, type) {
  const resolved = type?.resolved_path;
  if (!resolved) return null;
  const path = ctx.docs.pathOf(ctx.index, resolved.id);
  if (!path) return null;
  const hit = ctx.docs.find(path);
  if (!hit || !hit.item.inner.enum) return null;
  const variants = hit.item.inner.enum.variants
    .map(id => ctx.docs.item(hit.index, id))
    .filter(Boolean);
  const plain = variants.filter(v => v.inner.variant.kind === 'plain');
  if (plain.length === 0) return null;
  return {
    path,
    publicPath: ctx.publicPath(hit.index, hit.id) ?? path,
    name: hit.item.name,
    variants: plain.map(v => v.name),
    skippedVariants: variants.length - plain.length,
  };
}

export function mapType(ctx, rawType) {
  const type = unwrapInto(rawType);
  if (!type) return { unsupported: 'a type that could not be resolved' };
  if (type.primitive === 'bool') return { kind: 'bool' };
  if (type.primitive && INTS.has(type.primitive))
    return { kind: 'int', rust: type.primitive };
  if (type.primitive && FLOATS.has(type.primitive))
    return { kind: 'float', rust: type.primitive };
  if (type.primitive === 'str') return { kind: 'string' };
  if (type.borrowed_ref?.type?.primitive === 'str') return { kind: 'string' };
  const name = type.resolved_path
    ? type.resolved_path.path.split('::').pop()
    : null;
  if (name === 'String' || name === 'SharedString' || name === 'Text')
    return { kind: 'string', shared: name === 'SharedString' };
  if (name === 'ImageSource') return { kind: 'image' };
  if (name === 'Duration') return { kind: 'duration' };
  if (name === 'Icon' || name === 'IconName' || name === 'ButtonIcon')
    return { kind: 'icon' };
  if (name === 'Hsla' || name === 'Rgba') return { kind: 'color', rust: name };
  if (name === 'Pixels') return { kind: 'pixels' };
  if (name === 'Option') {
    const inner = mapType(ctx, genericArgs(type.resolved_path)[0]);
    return inner.unsupported ? inner : { ...inner, optional: true };
  }
  const info = enumInfo(ctx, type);
  if (info) return { kind: 'enum', info };
  if (type.borrowed_ref?.type?.dyn_trait)
    return { unsupported: 'a trait object argument (`&dyn ...`)' };
  if (type.borrowed_ref)
    return { unsupported: `a borrowed ${typeName(type.borrowed_ref.type)}` };
  if (type.impl_trait) {
    if (closureOf(type)) return { unsupported: 'a closure' };
    return { unsupported: `a generic argument (${typeName(type)})` };
  }
  return { unsupported: `the type ${typeName(type)} has no mapping` };
}
