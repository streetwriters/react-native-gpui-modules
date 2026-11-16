find_program(_node node REQUIRED)
execute_process(
  COMMAND "${_node}" -e "process.stdout.write(require.resolve('@react-native-gpui/nitro-modules/package.json', {paths: [process.argv[1]]}))" "${RN_GPUI_PROJECT_ROOT}"
  RESULT_VARIABLE _adapter_result
  OUTPUT_VARIABLE _adapter_package_json
  OUTPUT_STRIP_TRAILING_WHITESPACE)
if(NOT _adapter_result EQUAL 0 OR NOT EXISTS "${_adapter_package_json}")
  message(FATAL_ERROR "@react-native-gpui/nitro-modules could not be resolved from ${RN_GPUI_PROJECT_ROOT}")
endif()
get_filename_component(_adapter_root "${_adapter_package_json}" DIRECTORY)
include("${_adapter_root}/desktop/NitroDesktop.cmake")

set(_fixture_cpp "${CMAKE_CURRENT_LIST_DIR}/../cpp")
set(_fixture_sources
  "${_fixture_cpp}/HybridNitroFixture.cpp"
  "${_fixture_cpp}/HybridNitroFixtureView.cpp")
if(APPLE)
  list(APPEND _fixture_sources "${_fixture_cpp}/HybridNitroFixtureViewMac.mm")
endif()

rn_gpui_nitro_library(
  PACKAGE react-native-nitro-fixture
  SOURCES ${_fixture_sources}
  INCLUDE_DIRS "${_fixture_cpp}"
  VIEWS "NitroFixtureView=HybridNitroFixtureView")
