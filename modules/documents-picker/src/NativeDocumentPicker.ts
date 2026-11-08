import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type PickOptions = {
  type?: string[];
  mode?: string;
  allowMultiSelection?: boolean;
};

export type PickedDocument = {
  uri: string;
  name: string | null;
  error: string | null;
  type: string | null;
  nativeType: string | null;
  size: number | null;
  isVirtual: boolean | null;
  convertibleToMimeTypes: string[] | null;
};

export type DirectoryResult = {
  uri: string;
};

export type FileToCopy = {
  uri: string;
  fileName: string;
};

export type KeepLocalCopyOptions = {
  files: FileToCopy[];
  destination: string;
};

export type LocalCopyResult = {
  status: string;
  sourceUri: string;
  localUri?: string;
  copyError?: string;
};

export type WriteDocumentsOptions = {
  sourceUris: string[];
  fileName?: string;
  mimeType?: string;
  copy?: boolean;
};

export type WrittenDocument = {
  uri: string;
  name: string | null;
  error: string | null;
};

export type KnownType = {
  isKnown: boolean;
  preferredFilenameExtension: string | null;
  mimeType: string | null;
  UTType: string | null;
};

export type ReleaseResult = {
  uri: string;
  status: string;
};

export interface Spec extends TurboModule {
  pick(options: PickOptions): Promise<PickedDocument[]>;
  writeDocuments(options: WriteDocumentsOptions): Promise<WrittenDocument[]>;
  pickDirectory(options: PickOptions): Promise<DirectoryResult>;
  keepLocalCopy(options: KeepLocalCopyOptions): Promise<LocalCopyResult[]>;
  isKnownType(kind: string, value: string): KnownType;
  releaseSecureAccess(uris: string[]): Promise<void>;
  releaseLongTermAccess(uris: string[]): Promise<ReleaseResult[]>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNDocumentPicker');
