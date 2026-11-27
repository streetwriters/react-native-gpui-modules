import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  Dock,
  Questionnaire,
  type DockHandle,
  type QuestionnaireHandle,
} from '@react-native-gpui/gpui-kit';

const Button = ({ id, onPress }: { id: string; onPress: () => void }) => (
  <Pressable
    testID={id}
    onPress={onPress}
    style={{ height: 28, paddingHorizontal: 8, backgroundColor: '#dddddd' }}
  >
    <Text>{id}</Text>
  </Pressable>
);

export function GpuiKitPanelsFixture() {
  const dock = useRef<DockHandle>(null);
  const questions = useRef<QuestionnaireHandle>(null);
  const [log, setLog] = useState('');
  const add = (entry: string) => setLog(current => `${current}${entry};`);
  return (
    <View style={{ padding: 12, gap: 8 }}>
      <Text testID="panels-log">{`log ${log}`}</Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <Button
          id="panels-select"
          onPress={() => dock.current?.selectPanel('console')}
        />
        <Button
          id="panels-toggle"
          onPress={() => dock.current?.toggleDock('left')}
        />
        <Button id="panels-next" onPress={() => questions.current?.next()} />
        <Button
          id="panels-submit"
          onPress={() => questions.current?.submit()}
        />
      </View>
      <Dock
        ref={dock}
        testID="panels-dock"
        style={{ width: 640, height: 260 }}
        onLayoutChange={() => add('layout')}
        panels={[
          {
            id: 'editor',
            title: 'Editor',
            group: 'main',
            content: (
              <Text testID="panels-editor" style={{ color: '#ff0000' }}>
                editor
              </Text>
            ),
          },
          {
            id: 'console',
            title: 'Console',
            group: 'main',
            content: (
              <Text testID="panels-console" style={{ color: '#ff0000' }}>
                console
              </Text>
            ),
          },
          {
            id: 'files',
            title: 'Files',
            placement: 'left',
            content: (
              <Text testID="panels-files" style={{ color: '#ff0000' }}>
                files
              </Text>
            ),
          },
          {
            id: 'output',
            title: 'Output',
            placement: 'bottom',
            content: (
              <Text testID="panels-output" style={{ color: '#ff0000' }}>
                output
              </Text>
            ),
          },
        ]}
      />
      <Questionnaire
        ref={questions}
        testID="panels-questions"
        style={{ width: 480, height: 300 }}
        shortcuts="numbers"
        onAnswer={(item, answer) =>
          add(`answer ${item}=${answer.choices.join('+')}`)
        }
        onItemChange={current => add(`item ${current}`)}
        onSubmit={answers => add(`submit ${Object.keys(answers).join('+')}`)}
        questions={[
          {
            name: 'color',
            label: 'Favourite colour',
            required: true,
            choices: [{ value: 'red' }, { value: 'green' }],
          },
          {
            name: 'size',
            label: 'Size',
            choices: [{ value: 'small' }, { value: 'large' }],
          },
        ]}
      />
    </View>
  );
}
