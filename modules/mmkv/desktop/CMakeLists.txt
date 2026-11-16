if(NOT RN_GPUI_PROJECT_ROOT)
  message(FATAL_ERROR
    "@react-native-gpui/mmkv was added by the platform; RN_GPUI_PROJECT_ROOT must be set by its build.rs")
endif()
find_program(_gpui_node node REQUIRED)

function(_gpui_mmkv_resolve out package)
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

_gpui_mmkv_resolve(_mmkv_root react-native-mmkv)
_gpui_mmkv_resolve(_nitro_adapter_root @react-native-gpui/nitro-modules)

execute_process(
  COMMAND "${_gpui_node}" -e
    "process.stdout.write(require(process.argv[1] + '/package.json').version)"
    "${_mmkv_root}"
  OUTPUT_VARIABLE _mmkv_version
  OUTPUT_STRIP_TRAILING_WHITESPACE)
if(NOT _mmkv_version MATCHES "^4\\.3\\.")
  message(FATAL_ERROR
    "@react-native-gpui/mmkv supports react-native-mmkv 4.3.x, found ${_mmkv_version}")
endif()

include("${_nitro_adapter_root}/desktop/NitroDesktop.cmake")

# Tencent MMKV Core, the version react-native-mmkv pins, downloaded once into
# the shared native-deps cache. react-native-mmkv includes it as <MMKV/MMKV.h>,
# so the extracted Core folder is copied to a folder named MMKV. FORCE_POSIX
# selects the portable implementation on macOS, which keeps Objective-C out of
# the build.
set(_mmkv_core_version 2.4.0)
set(_mmkv_core_sha256 ea31077212e81c930370d2d142e76c5005c63d9f359211f03766b49d89b28ce5)
if(RN_GPUI_NATIVE_DEPS_CACHE)
  set(_mmkv_cache "${RN_GPUI_NATIVE_DEPS_CACHE}")
elseif(NOT "$ENV{RN_GPUI_NATIVE_DEPS_CACHE}" STREQUAL "")
  set(_mmkv_cache "$ENV{RN_GPUI_NATIVE_DEPS_CACHE}")
else()
  set(_mmkv_cache "${CMAKE_BINARY_DIR}/native-deps/cache")
endif()
file(TO_CMAKE_PATH "${_mmkv_cache}" _mmkv_cache)
string(SUBSTRING "${_mmkv_core_sha256}" 0 12 _mmkv_key)
set(_mmkv_extracted "${_mmkv_cache}/sources/mmkv-${_mmkv_key}")
set(_mmkv_include "${_mmkv_cache}/sources/mmkv-${_mmkv_key}-include")
if(NOT EXISTS "${_mmkv_include}/MMKV/MMKV.h")
  set(_mmkv_archive "${_mmkv_cache}/downloads/mmkv-${_mmkv_core_version}.tar.gz")
  if(NOT EXISTS "${_mmkv_archive}")
    message(STATUS "Downloading Tencent MMKV ${_mmkv_core_version}")
    file(DOWNLOAD
      "https://codeload.github.com/Tencent/MMKV/tar.gz/refs/tags/v${_mmkv_core_version}"
      "${_mmkv_archive}.part"
      EXPECTED_HASH SHA256=${_mmkv_core_sha256}
      TLS_VERIFY ON
      STATUS _mmkv_status)
    list(GET _mmkv_status 0 _mmkv_code)
    if(NOT _mmkv_code EQUAL 0)
      file(REMOVE "${_mmkv_archive}.part")
      message(FATAL_ERROR "Downloading Tencent MMKV ${_mmkv_core_version} failed: ${_mmkv_status}")
    endif()
    file(RENAME "${_mmkv_archive}.part" "${_mmkv_archive}")
  endif()
  file(REMOVE_RECURSE "${_mmkv_extracted}.part" "${_mmkv_include}.part")
  file(ARCHIVE_EXTRACT INPUT "${_mmkv_archive}" DESTINATION "${_mmkv_extracted}.part")
  file(MAKE_DIRECTORY "${_mmkv_include}.part")
  file(RENAME "${_mmkv_extracted}.part/MMKV-${_mmkv_core_version}/Core" "${_mmkv_include}.part/MMKV")
  file(REMOVE_RECURSE "${_mmkv_extracted}.part")
  file(REMOVE_RECURSE "${_mmkv_include}")
  file(RENAME "${_mmkv_include}.part" "${_mmkv_include}")
endif()
set(_mmkv_core "${_mmkv_include}/MMKV")
set(_mmkv_core_sources
  ${_mmkv_core}/MMKV.cpp
  ${_mmkv_core}/MMKV_IO.cpp
  ${_mmkv_core}/MMKVLog.cpp
  ${_mmkv_core}/CodedInputData.cpp
  ${_mmkv_core}/CodedInputDataCrypt.cpp
  ${_mmkv_core}/CodedOutputData.cpp
  ${_mmkv_core}/KeyValueHolder.cpp
  ${_mmkv_core}/PBUtility.cpp
  ${_mmkv_core}/MiniPBCoder.cpp
  ${_mmkv_core}/MMBuffer.cpp
  ${_mmkv_core}/InterProcessLock.cpp
  ${_mmkv_core}/MemoryFile.cpp
  ${_mmkv_core}/ThreadLock.cpp
  ${_mmkv_core}/aes/AESCrypt.cpp
  ${_mmkv_core}/aes/openssl/openssl_aes_core.cpp
  ${_mmkv_core}/aes/openssl/openssl_cfb128.cpp
  ${_mmkv_core}/aes/openssl/openssl_md5_dgst.cpp
  ${_mmkv_core}/aes/openssl/openssl_md5_one.cpp
  ${_mmkv_core}/crc32/crc32_armv8.cpp
  ${_mmkv_core}/crc32/zlib/crc32.cpp)
if(WIN32)
  list(APPEND _mmkv_core_sources
    ${_mmkv_core}/InterProcessLock_Win32.cpp
    ${_mmkv_core}/MemoryFile_Win32.cpp
    ${_mmkv_core}/ThreadLock_Win32.cpp)
elseif(NOT APPLE)
  list(APPEND _mmkv_core_sources ${_mmkv_core}/MemoryFile_Linux.cpp)
endif()

# The ARMv8 AES routines are assembly; the preprocessed source is pulled into a
# C++ file so the app build needs no assembler language.
if(NOT WIN32 AND CMAKE_SYSTEM_PROCESSOR MATCHES "arm64|aarch64|ARM64")
  set(_mmkv_aes_arm "${CMAKE_CURRENT_BINARY_DIR}/mmkv-aes-arm.s")
  execute_process(
    COMMAND ${CMAKE_CXX_COMPILER} -E -P -x assembler-with-cpp
      -I${_mmkv_core}/aes/openssl
      ${_mmkv_core}/aes/openssl/openssl_aesv8-armx.S
      -o ${_mmkv_aes_arm}
    COMMAND_ERROR_IS_FATAL ANY)
  list(APPEND _mmkv_core_sources "${CMAKE_CURRENT_LIST_DIR}/cpp/aes-arm.cpp")
  set_property(GLOBAL APPEND PROPERTY RN_GPUI_APP_CPP_DEFINITIONS
    "MMKV_AES_ARM_ASM=\"${_mmkv_aes_arm}\"")
endif()

file(GLOB _mmkv_sources CONFIGURE_DEPENDS "${_mmkv_root}/cpp/*.cpp")
file(GLOB _mmkv_desktop_sources CONFIGURE_DEPENDS "${CMAKE_CURRENT_LIST_DIR}/cpp/Hybrid*.cpp")

rn_gpui_nitro_library(
  PACKAGE react-native-mmkv
  SOURCES ${_mmkv_sources} ${_mmkv_core_sources} ${_mmkv_desktop_sources}
  INCLUDE_DIRS
    "${_mmkv_root}/cpp"
    "${_mmkv_include}"
    "${CMAKE_CURRENT_LIST_DIR}/cpp"
  HYBRIDS "MMKVPlatformContext=HybridMMKVPlatformContextDesktop")

set_property(GLOBAL APPEND PROPERTY RN_GPUI_APP_CPP_DEFINITIONS MMKV_EMBED_ZLIB=1)
if(APPLE)
  set_property(GLOBAL APPEND PROPERTY RN_GPUI_APP_CPP_DEFINITIONS FORCE_POSIX)
endif()
if(WIN32)
  set_property(GLOBAL APPEND PROPERTY RN_GPUI_APP_CPP_DEFINITIONS UNICODE _UNICODE)
endif()
