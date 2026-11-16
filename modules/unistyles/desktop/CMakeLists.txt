if(NOT RN_GPUI_PROJECT_ROOT)
  message(FATAL_ERROR
    "@react-native-gpui/unistyles was added by the platform; RN_GPUI_PROJECT_ROOT must be set by its build.rs")
endif()
find_program(_gpui_node node REQUIRED)

function(_gpui_unistyles_resolve out package)
  execute_process(
    COMMAND "${_gpui_node}" -e
      "process.stdout.write(require.resolve(process.argv[2] + '/package.json', {paths: [process.argv[1]]}))"
      "${RN_GPUI_PROJECT_ROOT}" "${package}"
    RESULT_VARIABLE _result
    OUTPUT_VARIABLE _package_json
    OUTPUT_STRIP_TRAILING_WHITESPACE)
  if(NOT _result EQUAL 0 OR NOT EXISTS "${_package_json}")
    message(FATAL_ERROR "${package} could not be resolved from ${RN_GPUI_PROJECT_ROOT}")
  endif()
  set_property(DIRECTORY APPEND PROPERTY CMAKE_CONFIGURE_DEPENDS "${_package_json}")
  get_filename_component(_root "${_package_json}" DIRECTORY)
  set(${out} "${_root}" PARENT_SCOPE)
endfunction()

_gpui_unistyles_resolve(_unistyles_root react-native-unistyles)
_gpui_unistyles_resolve(_nitro_adapter_root @react-native-gpui/nitro-modules)

execute_process(
  COMMAND "${_gpui_node}" -e
    "process.stdout.write(require(process.argv[1] + '/package.json').version)"
    "${_unistyles_root}"
  OUTPUT_VARIABLE _unistyles_version
  OUTPUT_STRIP_TRAILING_WHITESPACE)
if(NOT _unistyles_version MATCHES "^3\\.8\\.")
  message(FATAL_ERROR
    "@react-native-gpui/unistyles supports react-native-unistyles 3.8.x, found ${_unistyles_version}")
endif()

include("${_nitro_adapter_root}/desktop/NitroDesktop.cmake")

file(GLOB_RECURSE _unistyles_sources CONFIGURE_DEPENDS "${_unistyles_root}/cxx/*.cpp")
file(GLOB _unistyles_desktop_sources CONFIGURE_DEPENDS "${CMAKE_CURRENT_LIST_DIR}/cpp/*.cpp")

rn_gpui_nitro_library(
  PACKAGE react-native-unistyles
  SOURCES ${_unistyles_sources} ${_unistyles_desktop_sources}
  INCLUDE_DIRS
    "${_unistyles_root}/cxx"
    "${_unistyles_root}/cxx/common"
    "${_unistyles_root}/cxx/core"
    "${_unistyles_root}/cxx/converters"
    "${_unistyles_root}/cxx/hybridObjects"
    "${_unistyles_root}/cxx/parser"
    "${_unistyles_root}/cxx/shadowTree"
    "${CMAKE_CURRENT_LIST_DIR}/include"
    "${CMAKE_CURRENT_LIST_DIR}/cpp")
set_property(GLOBAL APPEND PROPERTY RN_GPUI_APP_CPP_INIT_FUNCTIONS rn_gpui_unistyles_init)
