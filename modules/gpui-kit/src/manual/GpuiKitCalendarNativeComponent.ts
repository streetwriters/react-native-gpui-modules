import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  date?: string;
  endDate?: string;
  range?: boolean;
  controlled?: boolean;
  numberOfMonths?: CodegenTypes.Int32;
  firstDayOfWeek?: CodegenTypes.WithDefault<CodegenTypes.Int32, -1>;
  disabledWeekdays?: ReadonlyArray<CodegenTypes.Int32>;
  onGpuiKitCalendarChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ start: string; end: string }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitCalendar', {
  interfaceOnly: true,
});
