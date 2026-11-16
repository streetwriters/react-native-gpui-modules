import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as RNLocalize from 'react-native-localize';

export function LocalizeFixtureScreen() {
  const [report, setReport] = useState('');

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Pressable
        testID="localize-run"
        onPress={() =>
          setReport(
            JSON.stringify({
              locales: RNLocalize.getLocales().length,
              country: RNLocalize.getCountry(),
              currencies: RNLocalize.getCurrencies().length,
              timeZone: RNLocalize.getTimeZone(),
              calendar: RNLocalize.getCalendar(),
              temperature: RNLocalize.getTemperatureUnit(),
              clock24: RNLocalize.uses24HourClock(),
              metric: RNLocalize.usesMetricSystem(),
              decimal: RNLocalize.getNumberFormatSettings().decimalSeparator,
            }),
          )
        }
      >
        <Text>Read locale</Text>
      </Pressable>
      <Text testID="localize-report">{report || 'not read'}</Text>
    </View>
  );
}
