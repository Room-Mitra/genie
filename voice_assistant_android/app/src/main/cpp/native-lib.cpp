
#include <jni.h>
#include <string>
#include <android/log.h>
#include <fstream>
#include <sstream>
#include "whisper.h"
#include <vector>
#include <iostream>
#include <cstdint>

#define LOG_TAG "NativeSTT"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

// Keep the model context global
static struct whisper_context *ctx = nullptr;

// Load the Whisper model from assets or external file path
bool load_whisper_model(const char *model_path) {
    if (ctx != nullptr) {
        whisper_free(ctx);
    }

    struct whisper_context_params cparams = whisper_context_default_params();
    ctx = whisper_init_from_file_with_params(model_path, cparams);
    if (!ctx) {
        LOGE("Failed to load whisper model from: %s", model_path);
        return false;
    }

    LOGI("Whisper model loaded from: %s", model_path);
    return true;
}



bool load_wav_file_as_float(const std::string& filename, std::vector<float>& out_samples, int& sample_rate) {
    std::ifstream file(filename, std::ios::binary);
    if (!file.good()) {
        std::cerr << "Failed to open WAV file: " << filename << std::endl;
        return false;
    }

    // Read the WAV file header
    char riff[4];
    file.read(riff, 4);  // "RIFF"
    file.ignore(4);      // File size
    char wave[4];
    file.read(wave, 4);  // "WAVE"

    // Search for "fmt " and "data" chunks
    char chunk_id[4];
    uint32_t chunk_size;

    bool found_fmt = false;
    bool found_data = false;
    uint16_t audio_format = 0;
    uint16_t num_channels = 0;
    uint32_t byte_rate = 0;
    uint16_t block_align = 0;
    uint16_t bits_per_sample = 0;

    std::vector<uint8_t> raw_data;

    while (file.read(chunk_id, 4)) {
        file.read(reinterpret_cast<char*>(&chunk_size), 4);

        if (std::strncmp(chunk_id, "fmt ", 4) == 0) {
            found_fmt = true;
            file.read(reinterpret_cast<char*>(&audio_format), sizeof(uint16_t));
            file.read(reinterpret_cast<char*>(&num_channels), sizeof(uint16_t));
            file.read(reinterpret_cast<char*>(&sample_rate), sizeof(uint32_t));
            file.read(reinterpret_cast<char*>(&byte_rate), sizeof(uint32_t));
            file.read(reinterpret_cast<char*>(&block_align), sizeof(uint16_t));
            file.read(reinterpret_cast<char*>(&bits_per_sample), sizeof(uint16_t));

            file.ignore(chunk_size - 16);  // Skip the rest
        }
        else if (std::strncmp(chunk_id, "data", 4) == 0) {
            found_data = true;
            raw_data.resize(chunk_size);
            file.read(reinterpret_cast<char*>(raw_data.data()), chunk_size);
        }
        else {
            // Skip other chunks
            file.ignore(chunk_size);
        }
    }

    if (!found_fmt || !found_data) {
        std::cerr << "Missing 'fmt ' or 'data' chunk in WAV file." << std::endl;
        return false;
    }

    if (audio_format != 1) { // PCM
        std::cerr << "Only PCM WAV files are supported." << std::endl;
        return false;
    }

    if (bits_per_sample != 16 || num_channels != 1) {
        std::cerr << "Only 16-bit mono WAV files are supported." << std::endl;
        return false;
    }

    // Convert raw PCM 16-bit samples to float [-1.0, 1.0]
    size_t num_samples = raw_data.size() / 2;
    out_samples.resize(num_samples);

    for (size_t i = 0; i < num_samples; ++i) {
        int16_t sample = static_cast<int16_t>(raw_data[2 * i] | (raw_data[2 * i + 1] << 8));
        out_samples[i] = sample / 32768.0f;
    }

    return true;
}



// Run STT on the given audio file (must be 16-bit PCM WAV, mono, 16 kHz)
std::string transcribe(const char *audio_path) {
    if (!ctx) {
        LOGE("Whisper context not initialized");
        return "Model not loaded";
    }

    std::vector<float> samples;
    int sample_rate = 0;
    if (load_wav_file_as_float("/path/to/audio.wav", samples, sample_rate)) {
        LOGI("Audio samples are ready for whisper_full");
    } else {
        return "Error loading audio samples for whisper_full";
    }

    whisper_full_params params = whisper_full_default_params(WHISPER_SAMPLING_GREEDY);
    params.print_progress = true;



    if (whisper_full(ctx, params, samples.data(), samples.size()) != 0) {
        LOGE("Failed to process audio with Whisper");
        return "STT failed";
    }

    std::ostringstream oss;
    int n_segments = whisper_full_n_segments(ctx);
    for (int i = 0; i < n_segments; ++i) {
        const char *text = whisper_full_get_segment_text(ctx, i);
        oss << text << " ";
    }

    return oss.str();
}

extern "C"
JNIEXPORT jstring JNICALL
Java_com_example_voiceassistant_MainActivity_transcribeAudio(JNIEnv *env, jobject thiz, jstring filePath) {
    const char *path = env->GetStringUTFChars(filePath, 0);

    std::string model_path = "/data/data/com.example.voiceassistant/files/models/ggml-base.en.bin";
    if (!ctx && !load_whisper_model(model_path.c_str())) {
        env->ReleaseStringUTFChars(filePath, path);
        return env->NewStringUTF("Failed to load Whisper model");
    }

    std::string result = transcribe(path);
    env->ReleaseStringUTFChars(filePath, path);
    return env->NewStringUTF(result.c_str());
}
