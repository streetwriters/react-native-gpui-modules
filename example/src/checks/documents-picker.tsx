import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  errorCodes,
  isErrorWithCode,
  isKnownType,
  keepLocalCopy,
  pick,
  pickDirectory,
  saveDocuments,
  types,
} from '@react-native-documents/picker';
import type { ModuleChecks } from './types';

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const source = 'file:///etc/hosts';

function Dialogs() {
  const [output, setOutput] = useState('');
  const run = (label: string, action: () => Promise<unknown>) => async () => {
    try {
      setOutput(`${label}: ${JSON.stringify(await action())}`);
    } catch (error) {
      setOutput(
        `${label}: ${isErrorWithCode(error) ? error.code : 'error'} ${
          (error as Error).message
        }`,
      );
    }
  };
  const buttons: [string, () => Promise<unknown>][] = [
    ['pick', () => pick()],
    ['pick-images', () => pick({ type: types.images })],
    ['pick-many', () => pick({ allowMultiSelection: true })],
    ['pick-json', () => pick({ type: [types.json, types.plainText] })],
    ['pick-directory', () => pickDirectory({ requestLongTermAccess: false })],
    [
      'save',
      async () => {
        const [copy] = await keepLocalCopy({
          files: [{ uri: source, fileName: 'hosts.txt' }],
          destination: 'cachesDirectory',
        });
        if (copy.status !== 'success') throw new Error(copy.copyError);
        return saveDocuments({
          sourceUris: [copy.localUri],
          copy: true,
          fileName: 'export.txt',
        });
      },
    ],
  ];
  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {buttons.map(([label, action]) => (
          <Pressable
            key={label}
            testID={`dialog-${label}`}
            onPress={run(label, action)}
            style={{ padding: 8, margin: 4, backgroundColor: '#d8e6ff' }}
          >
            <Text style={{ color: '#000000' }}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <Text testID="dialog-output" style={{ color: '#000000' }}>
        {output}
      </Text>
    </View>
  );
}

const documentsPicker: ModuleChecks = {
  name: 'documents-picker',
  view: <Dialogs />,
  checks: [
    [
      'exposes the predefined types',
      () => {
        assert(typeof types.allFiles === 'string', 'allFiles missing');
        assert(typeof types.images === 'string', 'images missing');
        assert(
          errorCodes.OPERATION_CANCELED === 'OPERATION_CANCELED',
          'error code differs',
        );
      },
    ],
    [
      'knows types by extension, mime type and UTI',
      () => {
        const byExtension = isKnownType({ kind: 'extension', value: 'pdf' });
        assert(
          byExtension.isKnown && byExtension.mimeType === 'application/pdf',
          'pdf extension',
        );
        const byMime = isKnownType({ kind: 'mimeType', value: 'image/png' });
        assert(
          byMime.isKnown && byMime.preferredFilenameExtension === 'png',
          'png mime type',
        );
        const byUti = isKnownType({ kind: 'UTType', value: 'com.adobe.pdf' });
        assert(
          byUti.isKnown && byUti.mimeType === 'application/pdf',
          'pdf UTI',
        );
        assert(
          !isKnownType({ kind: 'extension', value: 'nosuchext' }).isKnown,
          'unknown known',
        );
      },
    ],
    [
      'keeps a local copy of a file',
      async () => {
        const [copy] = await keepLocalCopy({
          files: [{ uri: source, fileName: 'hosts-copy.txt' }],
          destination: 'cachesDirectory',
        });
        if (copy.status !== 'success') throw new Error(copy.copyError);
        assert(copy.sourceUri === source, 'sourceUri differs');
        assert(
          copy.localUri.startsWith('file:///'),
          `localUri is ${copy.localUri}`,
        );
        assert(
          copy.localUri.endsWith('/hosts-copy.txt'),
          `localUri is ${copy.localUri}`,
        );
        const [again] = await keepLocalCopy({
          files: [{ uri: copy.localUri, fileName: 'again.txt' }],
          destination: 'documentDirectory',
        });
        assert(again.status === 'success', 'the copy does not exist');
      },
    ],
    [
      'reports a failed copy per file',
      async () => {
        const [copy] = await keepLocalCopy({
          files: [{ uri: 'file:///no/such/file.bin', fileName: 'x.bin' }],
          destination: 'cachesDirectory',
        });
        if (copy.status !== 'error') throw new Error('expected an error');
        assert(typeof copy.copyError === 'string', 'copyError missing');
      },
    ],
  ],
};

export default documentsPicker;
