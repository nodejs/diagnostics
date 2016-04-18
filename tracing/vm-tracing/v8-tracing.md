## V8/Chromium Tracing  
Generic macro definitions intended to be shared by many projects are in `trace_event_common.h`.  
Source of truth for `trace_event_common.h` is in `chromium:src/base/trace_event/trace_event_common.h`.  
This file is in Chromium but not in V8. @ofrobots copied it into `nodejs:deps/v8`. Perhaps it should be moved to `nodejs:deps/v8/include` or `nodejs:deps/v8/src/trace_event`.  

Implementation-specific ("INTERNAL_*") macro definitions are in `v8:src/trace_event.h` and `chromium:src/base/trace_event.h`.  
Chromium: `trace_event.h` macros utilize `v8::base::TraceLog::AddTraceEvent` to write traces.  
V8: `trace_event.h` macros utilize `v8::Platform::AddTraceEvent` to write traces.  
Node uses `DefaultPlatform` from `v8:src/libplatform/default-platform.h` which currently simply returns 0.  
A simplistic implementation which logs all trace events to stdout illustrates the basics:

```
// from v8:src/libplatform/default-platform.cc
// add `#include <iostream>` to includes

uint64_t DefaultPlatform::AddTraceEvent(
    char phase, const uint8_t* category_enabled_flag, const char* name,
    /* const char* scope, */ uint64_t id, uint64_t bind_id, int num_args,
    const char** arg_names, const uint8_t* arg_types,
    const uint64_t* arg_values, unsigned int flags) {

  time_t timestamp = std::time(nullptr);

  std::cout << "phase: " << phase << std::endl;
  std::cout << "category_enabled_flag: " << category_enabled_flag << std::endl;
  std::cout << "name: " << name << std::endl;
  std::cout << "id: " << id << std::endl;
  std::cout << "epoch_timestamp: " << timestamp << std::endl;
  std::cout << "human_timestamp: " << std::asctime(std::localtime(&timestamp)) << std::endl;

  return 0;
}

const uint8_t* DefaultPlatform::GetCategoryGroupEnabled(const char* name) {
  static uint8_t yes = CategoryGroupEnabledFlags::kEnabledForRecording_CategoryGroupEnabledFlags | 
    CategoryGroupEnabledFlags::kEnabledForEventCallback_CategoryGroupEnabledFlags;
  return &yes;
}
```
