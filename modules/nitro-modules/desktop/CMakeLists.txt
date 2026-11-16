include("${CMAKE_CURRENT_LIST_DIR}/NitroDesktop.cmake")
get_property(_nitro_core_sources GLOBAL PROPERTY RN_GPUI_NITRO_CORE_SOURCES)

file(GLOB _nitro_desktop_sources CONFIGURE_DEPENDS "${CMAKE_CURRENT_LIST_DIR}/cpp/*.cpp")
rn_gpui_nitro_prelude(${_nitro_core_sources} ${_nitro_desktop_sources})
set_property(GLOBAL APPEND PROPERTY RN_GPUI_APP_CPP_SOURCES
  ${_nitro_core_sources}
  ${_nitro_desktop_sources})
