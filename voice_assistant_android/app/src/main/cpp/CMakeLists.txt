cmake_minimum_required(VERSION 3.18.1)
project("voiceassistant")

add_definitions(-DWHISPER_VERSION="1.5.0")

# Collect all cpp files under ggml/src
file(GLOB GGML_SRC whisper.cpp/ggml/src/*.c*)

# Collect all cpp files under whisper.cpp/src (if needed)
file(GLOB WHISPER_SRC whisper.cpp/src/*.c*)

add_library(native-lib
        SHARED
        native-lib.cpp
#        whisper.cpp/src/whisper.cpp
#        whisper.cpp/ggml/src/ggml.c
#        whisper.cpp/ggml/src/ggml-threading.cpp
#        whisper.cpp/ggml/src/ggml-backend-reg.cpp
        ${GGML_SRC}
        ${WHISPER_SRC}

)

# Tell CMake where to find whisper.h
include_directories(
        whisper.cpp/include
        whisper.cpp/ggml/include
        whisper.cpp/ggml/src
)

find_library(log-lib log)

target_link_libraries(native-lib ${log-lib})
