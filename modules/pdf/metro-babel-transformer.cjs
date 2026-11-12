const path = require('path');

const upstream = require(
  process.env.RN_GPUI_PDF_BABEL_TRANSFORMER ||
    '@react-native/metro-babel-transformer',
);

const EMBEDPDF = /(?:^|[\\/])node_modules[\\/]@embedpdf[\\/]/u;

function importMeta({ types: t }) {
  return {
    visitor: {
      MetaProperty(nodePath) {
        if (
          nodePath.node.meta.name === 'import' &&
          nodePath.node.property.name === 'meta'
        ) {
          nodePath.replaceWith(
            t.objectExpression([
              t.objectProperty(
                t.identifier('url'),
                t.stringLiteral('file:///'),
              ),
            ]),
          );
        }
      },
    },
  };
}

module.exports = {
  ...upstream,
  transform: args =>
    upstream.transform(
      EMBEDPDF.test(args.filename)
        ? { ...args, plugins: [...(args.plugins ?? []), importMeta] }
        : args,
    ),
  getCacheKey: () =>
    `${upstream.getCacheKey?.() ?? ''}$${require('crypto')
      .createHash('sha1')
      .update(
        require('fs').readFileSync(
          path.join(__dirname, 'metro-babel-transformer.cjs'),
        ),
      )
      .digest('hex')}`,
};
