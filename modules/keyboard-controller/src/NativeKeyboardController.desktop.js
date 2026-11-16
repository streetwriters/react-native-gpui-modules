import TextInputState from 'react-native/Libraries/Components/TextInput/TextInputState';
import { DesktopWindow, MAIN_WINDOW_ID } from '@react-native-gpui/core/desktop';

async function focusedWindow() {
  const windows = await DesktopWindow.all();
  for (const window of windows) {
    if ((await window.getState()).isFocused) return window;
  }
  return windows.find(window => window.id === MAIN_WINDOW_ID) ?? windows[0];
}

const NativeKeyboardController = {
  getConstants: () => ({ keyboardBorderRadius: 0 }),
  setInputMode: () => {},
  setDefaultMode: () => {},
  preload: () => {},
  setTranslucent: () => {},
  dismiss: keepFocus => {
    if (keepFocus) return;
    const input = TextInputState.currentlyFocusedInput();
    if (input) TextInputState.blurTextInput(input);
  },
  setFocusTo: direction => {
    if (direction !== 'next' && direction !== 'prev') return;
    focusedWindow()
      .then(window =>
        direction === 'next' ? window?.focusNext() : window?.focusPrevious(),
      )
      .catch(() => {});
  },
  viewPositionInWindow: () =>
    Promise.resolve({ x: 0, y: 0, width: 0, height: 0 }),
  addListener: () => {},
  removeListeners: () => {},
};

export default NativeKeyboardController;
