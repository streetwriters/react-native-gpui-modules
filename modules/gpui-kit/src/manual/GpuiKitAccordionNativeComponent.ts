import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type AccordionItem = Readonly<{
  title: string;
  icon: string;
  open: boolean;
  disabled: boolean;
}>;

export interface NativeProps extends ViewProps {
  items?: ReadonlyArray<AccordionItem>;
  multiple?: boolean;
  bordered?: CodegenTypes.WithDefault<boolean, true>;
  disabled?: boolean;
  size?: CodegenTypes.WithDefault<
    'unset' | 'xsmall' | 'small' | 'medium' | 'large',
    'unset'
  >;
  slots?: string;
  titleStyle?: string;
  contentStyle?: string;
  itemHoverStyle?: string;
  onGpuiKitAccordionToggle?: CodegenTypes.DirectEventHandler<
    Readonly<{ open: string }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitAccordion', {
  interfaceOnly: true,
});
