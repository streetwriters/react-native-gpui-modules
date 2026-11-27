import { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  DataTable,
  Dock,
  Editor,
  Input,
  List,
  Questionnaire,
  Settings,
  Speech,
  Textarea,
  type DataTableHandle,
  type DockHandle,
  type InputHandle,
  type QuestionnaireHandle,
  type SpeechHandle,
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

const lines = Array.from({ length: 40 }, (_, i) => `line ${i}`).join('\n');

/** One scenario per feature that fills a former coverage gap. */
export function GpuiKitGapsFixture({ scenario }: { scenario?: string }) {
  const input = useRef<InputHandle>(null);
  const speech = useRef<SpeechHandle>(null);
  const dock = useRef<DockHandle>(null);
  const table = useRef<DataTableHandle>(null);
  const [tableRows, setTableRows] = useState(40);
  const questions = useRef<QuestionnaireHandle>(null);
  const layout = useRef('');
  const [log, setLog] = useState('');
  const add = (entry: string) => setLog(current => `${current}${entry};`);
  const logView = <Text testID="gaps-log">{`log ${log}`}</Text>;
  switch (scenario) {
    case 'token':
      return (
        <View style={{ padding: 12, gap: 8 }}>
          <Button
            id="gaps-insert"
            onPress={() => input.current?.insertToken('t1', '@ann', 'Ann')}
          />
          <Input
            ref={input}
            testID="gaps-input"
            style={{ width: 320, height: 40 }}
            renderToken={({ id }) => (
              <View
                testID={`gaps-token-${id}`}
                style={{ width: 40, height: 16, backgroundColor: '#ff0000' }}
              />
            )}
          />
        </View>
      );
    case 'list':
      return (
        <View style={{ padding: 12, gap: 8 }}>
          {logView}
          <List
            testID="gaps-list"
            style={{ width: 240, height: 200 }}
            rows={['One', 'Two', 'Three'].map(label => ({ label }))}
            draggableRows
            hasMore={!log.includes('more')}
            onLoadMore={() => add('more')}
            onMove={(from, to, position) =>
              add(`move ${from}>${to} ${position}`)
            }
          />
        </View>
      );
    case 'validation':
      return (
        <View style={{ padding: 12, gap: 8 }}>
          {logView}
          <Button id="gaps-good" onPress={() => input.current?.insert('ab')} />
          <Button id="gaps-bad" onPress={() => input.current?.insert('9')} />
          <Input
            ref={input}
            testID="gaps-input"
            style={{ width: 320, height: 40 }}
            validation={{ pattern: '^[a-z]*$', message: 'letters only' }}
            onChangeText={text => add(`change ${text}`)}
            onValidationFail={event =>
              add(`fail ${event.nativeEvent.text}:${event.nativeEvent.message}`)
            }
          />
        </View>
      );
    case 'selection':
      return (
        <View style={{ padding: 12, gap: 8 }}>
          {logView}
          <Button
            id="gaps-hold"
            onPress={() => input.current?.holdSelection(true)}
          />
          <Button
            id="gaps-release"
            onPress={() => input.current?.holdSelection(false)}
          />
          <Input
            ref={input}
            testID="gaps-input"
            defaultValue="hello"
            style={{ width: 320, height: 40 }}
            onSelectionHoldChange={event =>
              add(`held ${event.nativeEvent.held}`)
            }
          />
        </View>
      );
    case 'scrollbar':
      return (
        <View style={{ padding: 12 }}>
          <Textarea
            testID="gaps-textarea"
            defaultValue={lines}
            style={{ width: 320, height: 160 }}
            scrollbarStyle={{
              thumbColor: '#ff0000',
              trackColor: '#ff0000',
              width: 10,
              radius: 0,
              autoHide: false,
            }}
          />
        </View>
      );
    case 'editor':
      return (
        <View style={{ padding: 12, gap: 8 }}>
          <Editor
            testID="gaps-editor"
            language="json"
            value={'{\n  "a": [\n    1,\n    2\n  ]\n}'}
            highlightTheme="dark"
            editorStyle={{ background: '#ff0000' }}
            foldPlaceholder="…"
            style={{ width: 320, height: 160 }}
          />
          <Editor
            testID="gaps-editor-plain"
            language="json"
            value={'{ "a": 1 }'}
            style={{ width: 320, height: 80 }}
          />
        </View>
      );
    case 'settings':
      return (
        <Settings
          testID="gaps-settings"
          style={{ width: 640, height: 300 }}
          entries={[
            {
              page: 'General',
              title: 'Kit field',
              description: 'Drawn by the kit',
              field: (
                <View
                  testID="gaps-field"
                  style={{ height: 24, backgroundColor: '#ff0000' }}
                />
              ),
            },
          ]}
        />
      );
    case 'speech':
      return (
        <View style={{ padding: 12, gap: 8 }}>
          {logView}
          <Button id="gaps-start" onPress={() => speech.current?.start()} />
          <Button
            id="gaps-audio"
            onPress={() => speech.current?.pushAudio([0, 1000, -1000, 0])}
          />
          <Button
            id="gaps-phrase"
            onPress={() => {
              speech.current?.recognizerReady();
              speech.current?.pushPhrase('hello');
            }}
          />
          <Button id="gaps-stop" onPress={() => speech.current?.stop()} />
          <Button
            id="gaps-finish"
            onPress={() => speech.current?.finishRecognition()}
          />
          <Speech
            ref={speech}
            testID="gaps-speech"
            recognizer="js"
            audioInput="js"
            onRecognizerStart={f => add(`recognizer ${f.sampleRate}`)}
            onAudioStart={f => add(`audio ${f.channels}`)}
            onRecognizerFinish={() => add('finish')}
            onRecognizerEnd={() => add('end')}
            onAudioStop={() => add('audiostop')}
            onTranscript={(text, done) => add(`transcript ${text}|${done}`)}
            onError={message => add(`error ${message}`)}
          />
        </View>
      );
    case 'dock':
      return (
        <View style={{ padding: 12, gap: 8 }}>
          {logView}
          <Button
            id="gaps-restore"
            onPress={() => dock.current?.restoreLayout(layout.current)}
          />
          <Dock
            ref={dock}
            testID="gaps-dock"
            style={{ width: 640, height: 260 }}
            onLayoutChange={value => {
              layout.current = value;
              add(`layout ${value.includes('"key":"files"')}`);
            }}
            panels={[
              {
                id: 'editor',
                title: 'Editor',
                content: <Text testID="gaps-panel-editor">editor</Text>,
              },
              {
                id: 'files',
                title: 'Files',
                placement: 'left',
                content: <Text testID="gaps-panel-files">files</Text>,
              },
            ]}
          />
        </View>
      );
    case 'questionnaire':
      return (
        <View style={{ padding: 12, gap: 8 }}>
          {logView}
          <Button id="gaps-next" onPress={() => questions.current?.next()} />
          <Questionnaire
            ref={questions}
            testID="gaps-questions"
            style={{ width: 480, height: 300 }}
            shortcuts="numbers"
            onItemChange={current => add(`item ${current}`)}
            questions={[
              {
                name: 'color',
                label: 'Colour',
                validation: { pattern: '^green$', message: 'pick green' },
                choices: [{ value: 'red' }, { value: 'green' }],
              },
              { name: 'size', label: 'Size', choices: [{ value: 'small' }] },
            ]}
          />
        </View>
      );
    case 'table':
      return (
        <View style={{ padding: 12, gap: 8 }}>
          {logView}
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <Button
              id="gaps-scroll"
              onPress={() => table.current?.scrollToRow(35)}
            />
            <Button
              id="gaps-select"
              onPress={() => table.current?.selectCell(3, 2)}
            />
            <Button
              id="gaps-clear"
              onPress={() => table.current?.clearSelection()}
            />
          </View>
          <DataTable
            ref={table}
            testID="gaps-table"
            style={{ width: 420, height: 260 }}
            columns={[
              { key: 'a', title: 'A', width: 100, sortable: true },
              { key: 'b', title: 'B', width: 100, sortable: true },
              { key: 'c', title: 'C', width: 100 },
            ]}
            rows={Array.from({ length: tableRows }, (_, r) => [
              `a${r}`,
              `b${r}`,
              `c${r}`,
            ])}
            cellSelectable
            columnResize
            columnOrder
            hasMore={tableRows < 80}
            loadMoreThreshold={5}
            contextMenu={[{ label: 'First' }, { label: 'Second' }]}
            onSort={e =>
              add(`sort ${e.nativeEvent.column} ${e.nativeEvent.direction}`)
            }
            onSelectRow={e => add(`row ${e.nativeEvent.row}`)}
            onSelectCell={e =>
              add(`cell ${e.nativeEvent.row}:${e.nativeEvent.column}`)
            }
            onSelectColumn={column => add(`col ${column}`)}
            onClearSelection={() => add('clear')}
            onMoveColumn={(from, to) => add(`move ${from}>${to}`)}
            onMenuSelect={(row, item) => add(`menu ${row}:${item}`)}
            onLoadMore={() => {
              add('more');
              setTableRows(80);
            }}
            onVisibleRangeChange={range => {
              if (range.rowStart > 20) add('scrolled');
            }}
          />
        </View>
      );
    default:
      return (
        <ScrollView>
          <Text>unknown scenario {scenario}</Text>
        </ScrollView>
      );
  }
}
