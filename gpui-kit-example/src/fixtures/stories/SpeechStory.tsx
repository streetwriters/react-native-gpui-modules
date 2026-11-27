import React, { useRef } from 'react';
import { View } from 'react-native';
import { Speech, type SpeechHandle } from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame } from './StoryKit';

/** `crates/story/src/stories/speech_story.rs` of gpui-component v0.9.1. */

/** What `DemoRecognizer` "hears", one phrase at a time. */
const SCRIPT = [
  'Speech input turns what you say into text.',
  'Any recognizer plugs in through one trait.',
];
/** How much 16 kHz mono audio `DemoRecognizer` takes per word: 0.3 s. */
const SAMPLES_PER_WORD = 4800;

/**
 * `DemoRecognizer`: types `SCRIPT` one word per `SAMPLES_PER_WORD` of audio,
 * whatever the audio contains.
 */
function useDemoRecognizer(speech: React.RefObject<SpeechHandle | null>) {
  const session = useRef({ phrase: 0, words: 0, samples: 0 });
  const spoken = () => {
    const { phrase, words } = session.current;
    const text = SCRIPT[phrase]?.split(' ').slice(0, words).join(' ');
    if (!text) return undefined;
    return `${phrase > 0 ? ' ' : ''}${text}`;
  };
  const commit = () => {
    const text = spoken();
    if (text) speech.current?.pushPhrase(text);
    session.current.phrase += 1;
    session.current.words = 0;
  };
  return {
    recognizer: 'js' as const,
    onRecognizerStart: () => {
      session.current = { phrase: 0, words: 0, samples: 0 };
      speech.current?.recognizerReady();
    },
    onRecognizerAudio: (samples: number) => {
      session.current.samples += samples;
      while (session.current.samples >= SAMPLES_PER_WORD) {
        session.current.samples -= SAMPLES_PER_WORD;
        const phrase = SCRIPT[session.current.phrase];
        if (!phrase) continue;
        session.current.words += 1;
        if (session.current.words < phrase.split(' ').length) {
          const text = spoken();
          if (text) speech.current?.pushHypothesis(text);
        } else commit();
      }
    },
    onRecognizerFinish: () => {
      commit();
      speech.current?.finishRecognition();
    },
  };
}

export function SpeechStory() {
  const custom = useRef<SpeechHandle>(null);
  const demo = useDemoRecognizer(custom);
  return (
    <StoryFrame testID="story-speech">
      <View style={{ width: '100%', gap: 12 }}>
        <Section
          title="With a custom recognizer"
          description="A recognizer defined in this story types a scripted sentence while it receives audio."
          style={{ width: 512 }}
        >
          <Speech
            ref={custom}
            variant="dictation"
            placeholder="Type or dictate"
            showWhenUnsupported={false}
            style={{ width: '100%' }}
            {...demo}
          />
        </Section>
        <Section
          title="System recognizer"
          description="Recognizes speech on macOS and Windows. Elsewhere, and in an app without the required usage descriptions, the button is disabled."
          style={{ width: 512 }}
        >
          <Speech
            variant="dictation"
            placeholder="Type or dictate"
            showWhenUnsupported
            style={{ width: '100%' }}
          />
        </Section>
      </View>
    </StoryFrame>
  );
}
