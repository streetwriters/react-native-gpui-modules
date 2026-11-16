# Desktop build support for Nitro libraries. A library's desktop/CMakeLists.txt
# resolves @react-native-gpui/nitro-modules, includes this file and calls
# rn_gpui_nitro_library().
include_guard(GLOBAL)

if(NOT RN_GPUI_PROJECT_ROOT)
  message(FATAL_ERROR "RN_GPUI_PROJECT_ROOT must be set by the build of the app")
endif()
find_program(_rn_gpui_nitro_node node REQUIRED)

# Sets <out> to the root directory of an npm package, resolved from the app.
function(rn_gpui_nitro_resolve_package out package)
  execute_process(
    COMMAND "${_rn_gpui_nitro_node}" -e
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

rn_gpui_nitro_resolve_package(RN_GPUI_NITRO_ROOT react-native-nitro-modules)
execute_process(
  COMMAND "${_rn_gpui_nitro_node}" -e
    "process.stdout.write(require(process.argv[1] + '/package.json').version)"
    "${RN_GPUI_NITRO_ROOT}"
  OUTPUT_VARIABLE _rn_gpui_nitro_version
  OUTPUT_STRIP_TRAILING_WHITESPACE)
if(NOT _rn_gpui_nitro_version MATCHES "^0\\.37\\.")
  message(FATAL_ERROR
    "@react-native-gpui/nitro-modules supports react-native-nitro-modules 0.37.x, found ${_rn_gpui_nitro_version}")
endif()

get_filename_component(RN_GPUI_NITRO_ADAPTER_DIR "${CMAKE_CURRENT_LIST_DIR}" ABSOLUTE)
# Included once for the whole build, so what the function and the other
# directories need is kept in global properties.
set_property(GLOBAL PROPERTY RN_GPUI_NITRO_ROOT "${RN_GPUI_NITRO_ROOT}")
set_property(GLOBAL PROPERTY RN_GPUI_NITRO_ADAPTER_DIR "${RN_GPUI_NITRO_ADAPTER_DIR}")
set(RN_GPUI_NITRO_INCLUDE_ROOT "${CMAKE_BINARY_DIR}/rn-gpui-nitro/include")
set(RN_GPUI_NITRO_HEADER_DIR "${RN_GPUI_NITRO_INCLUDE_ROOT}/NitroModules")

# Libraries include Nitro as <NitroModules/X.hpp>, a flat directory, so the
# headers are copied there from the package's nested layout.
file(GLOB_RECURSE _rn_gpui_nitro_headers CONFIGURE_DEPENDS
  "${RN_GPUI_NITRO_ROOT}/cpp/*.hpp" "${RN_GPUI_NITRO_ROOT}/cpp/*.h")
foreach(_header IN LISTS _rn_gpui_nitro_headers)
  get_filename_component(_name "${_header}" NAME)
  configure_file("${_header}" "${RN_GPUI_NITRO_HEADER_DIR}/${_name}" COPYONLY)
endforeach()
# The sources are copied too: a quoted include resolves beside the including
# file first, and a header must not be reached through two paths.
set(_rn_gpui_nitro_core_sources "")
file(GLOB_RECURSE _rn_gpui_nitro_cpp CONFIGURE_DEPENDS "${RN_GPUI_NITRO_ROOT}/cpp/*.cpp")
foreach(_source IN LISTS _rn_gpui_nitro_cpp)
  get_filename_component(_name "${_source}" NAME)
  set(_copy "${RN_GPUI_NITRO_INCLUDE_ROOT}/../src/${_name}")
  configure_file("${_source}" "${_copy}" COPYONLY)
  list(APPEND _rn_gpui_nitro_core_sources "${_copy}")
endforeach()
set_property(GLOBAL PROPERTY RN_GPUI_NITRO_CORE_SOURCES ${_rn_gpui_nitro_core_sources})
configure_file("${RN_GPUI_NITRO_ADAPTER_DIR}/cpp/GPUINitroHybridView.hpp"
  "${RN_GPUI_NITRO_HEADER_DIR}/GPUINitroHybridView.hpp" COPYONLY)
set_property(GLOBAL APPEND PROPERTY RN_GPUI_APP_CPP_INCLUDE_DIRS
  "${RN_GPUI_NITRO_INCLUDE_ROOT}"
  "${RN_GPUI_NITRO_HEADER_DIR}")

# rn_gpui_nitro_library(PACKAGE <npm-name>
#   [SOURCES <files>...] [INCLUDE_DIRS <dirs>...]
#   [HYBRIDS "Name=ImplClass"...] [VIEWS "ViewName=ImplClass"...])
#
# Adds the nitrogen output of PACKAGE and its C++ sources to the app, registers
# the Hybrid Objects `nitro.json` autolinks for C++ (and HYBRIDS; a package
# without nitro.json has no autolinked ones) and hosts each
# of VIEWS as a C++ host component. The package's react-native.config.js must
# declare every view under hostComponents with `cpp: true`.
function(rn_gpui_nitro_library)
  cmake_parse_arguments(ARG "" "PACKAGE" "SOURCES;INCLUDE_DIRS;HYBRIDS;VIEWS" ${ARGN})
  if(NOT ARG_PACKAGE)
    message(FATAL_ERROR "rn_gpui_nitro_library requires PACKAGE")
  endif()
  get_property(RN_GPUI_NITRO_ADAPTER_DIR GLOBAL PROPERTY RN_GPUI_NITRO_ADAPTER_DIR)
  rn_gpui_nitro_resolve_package(_package_root "${ARG_PACKAGE}")
  set(_nitro_json "${_package_root}/nitro.json")
  set(_generated "${_package_root}/nitrogen/generated/shared/c++")
  file(GLOB_RECURSE _generated_sources CONFIGURE_DEPENDS "${_generated}/*.cpp")
  set_property(DIRECTORY APPEND PROPERTY CMAKE_CONFIGURE_DEPENDS "${_nitro_json}")

  string(REGEX REPLACE "[^A-Za-z0-9_]" "_" _sanitized "${ARG_PACKAGE}")
  set(_init_source "${CMAKE_BINARY_DIR}/rn-gpui-nitro/${_sanitized}/NitroDesktopInit.cpp")
  set(_generator_args "")
  foreach(_hybrid IN LISTS ARG_HYBRIDS)
    list(APPEND _generator_args --hybrid "${_hybrid}")
  endforeach()
  foreach(_view IN LISTS ARG_VIEWS)
    list(APPEND _generator_args --view "${_view}")
    string(REGEX REPLACE "=.*$" "" _view_name "${_view}")
    set_property(DIRECTORY APPEND PROPERTY CMAKE_CONFIGURE_DEPENDS
      "${_generated}/views/Hybrid${_view_name}Component.hpp")
  endforeach()
  set_property(DIRECTORY APPEND PROPERTY CMAKE_CONFIGURE_DEPENDS
    "${RN_GPUI_NITRO_ADAPTER_DIR}/generate-nitro-desktop.mjs")
  execute_process(
    COMMAND "${_rn_gpui_nitro_node}" "${RN_GPUI_NITRO_ADAPTER_DIR}/generate-nitro-desktop.mjs"
      "${_package_root}" "${_init_source}" "${_sanitized}" ${_generator_args}
    RESULT_VARIABLE _generate_result
    ERROR_VARIABLE _generate_error)
  if(NOT _generate_result EQUAL 0)
    message(FATAL_ERROR "Nitro desktop registration for ${ARG_PACKAGE} failed: ${_generate_error}")
  endif()

  set_property(GLOBAL APPEND PROPERTY RN_GPUI_APP_CPP_SOURCES
    ${_generated_sources} ${ARG_SOURCES} "${_init_source}")
  set_property(GLOBAL APPEND PROPERTY RN_GPUI_APP_CPP_INCLUDE_DIRS
    "${_generated}" "${_generated}/views" ${ARG_INCLUDE_DIRS})
  set_property(GLOBAL APPEND PROPERTY RN_GPUI_APP_CPP_INIT_FUNCTIONS
    "rn_gpui_nitro_init_${_sanitized}")
endfunction()
