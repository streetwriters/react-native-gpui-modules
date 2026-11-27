# gpui-kit-example

The gallery app of [`@react-native-gpui/gpui-kit`](../modules/gpui-kit): the React Native counterpart of gpui-component's own story gallery (`crates/story` at v0.9.1). It lists the same stories in a sidebar, in the same order, and shows each one under the same title and description, built with the module's components, so the two galleries can be compared page by page.

## Run

```sh
npm install              # at the repository root
cd gpui-kit-example
npx react-native run-desktop
```

## Stories

`src/gallery/storyList.json` is the story list of the official gallery. Each ported story is a screen in `src/fixtures/stories` named after the official story file (`button_story.rs` is `ButtonStory.tsx`), registered in `src/fixtures/stories/index.ts` and listed in `meta.ts` (a story without a file of its own, Theme Colors, goes by its class in snake case, `theme_colors`); a story that is not ported yet says so in the gallery. `StoryKit.tsx` rebuilds the gallery's own helpers (`section`, `story_toolbar`, the size switch, notifications).

## Tests

The e2e specs in `desktop/e2e` cover the module: one spec per generated component (`gpui-kit-c-*`), the feature specs, and two parity specs against plain gpui-kit drawn by `tools/gpui-kit-gen/reference`:

- `gpui-kit-parity.e2e.ts` compares the cases of `src/fixtures/gpuiKitParityCases.json`.
- `gpui-kit-stories.e2e.ts` compares each ported story with the official story, which the reference app draws from the vendored story sources (`--story <name>`).

Every app of the repository builds into the shared `target/` at the repository root, so the binaries are `../target/debug/gpui-kit-example` and `../target/debug/gpui-kit-reference`.

```sh
(cd ../tools/gpui-kit-gen/reference && cargo build)
npx react-native run-desktop --features test-driver --no-launch
RN_GPUI_TEST_BINARY=../target/debug/gpui-kit-example npm run test:e2e
```

To compare one story, filter by its name: `npm run test:e2e -- desktop/e2e/gpui-kit-stories.e2e.ts -t "story button "`. The spec prints the folder it writes each story's capture, the reference capture and a diff image to.
