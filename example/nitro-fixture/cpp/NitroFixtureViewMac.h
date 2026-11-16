#pragma once

// A layer-backed NSView filled with a "#rrggbb" color, returned +1 retained.
void* nitroFixtureCreateView(const char* color);
void nitroFixtureFillView(void* view, const char* color);
