#import <AppKit/AppKit.h>

#include "NitroFixtureViewMac.h"

#include <cstdio>

static void fill(NSView* view, const char* color) {
  unsigned red = 0;
  unsigned green = 0;
  unsigned blue = 0;
  if (std::sscanf(color, "#%2x%2x%2x", &red, &green, &blue) != 3) {
    return;
  }
  CGColorRef cgColor = CGColorCreateSRGB(red / 255.0, green / 255.0, blue / 255.0, 1.0);
  view.layer.backgroundColor = cgColor;
  CGColorRelease(cgColor);
}

void* nitroFixtureCreateView(const char* color) {
  NSView* view = [[NSView alloc] init];
  view.wantsLayer = YES;
  fill(view, color);
  return (void*)view;
}

void nitroFixtureFillView(void* view, const char* color) {
  fill((NSView*)view, color);
}
