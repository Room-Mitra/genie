package com.example.voiceassistant

import android.Manifest
import android.content.Context
import android.media.MediaRecorder
import android.os.Bundle
import android.os.Environment
import android.util.Log
import android.view.MotionEvent
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import java.io.File
import java.io.FileOutputStream

class MainActivity : AppCompatActivity() {

    private external fun transcribeAudio(filePath: String): String
    private lateinit var recorder: MediaRecorder
    private lateinit var audioFile: File

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.RECORD_AUDIO), 0)

        val button = findViewById<Button>(R.id.sttButton)
        button.setOnClickListener {
            Log.d("STT", "performClick called (for accessibility compliance)")
        }
        button.setOnTouchListener { v, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    startRecording()
                    true
                }
                MotionEvent.ACTION_UP -> {
                    stopRecording()
                    val result = transcribeAudio(audioFile.absolutePath)
                    Log.d("STT", "Transcribed text: $result")
                    v.performClick()
                    true
                }
                else -> false
            }
        }
        copyModelIfNeeded(this)

    }

    private fun startRecording() {
        audioFile = File(getExternalFilesDir(Environment.DIRECTORY_MUSIC), "recorded_audio.wav")
        recorder = MediaRecorder().apply {
            setAudioSource(MediaRecorder.AudioSource.MIC)
            setOutputFormat(MediaRecorder.OutputFormat.THREE_GPP)
            setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB)
            setOutputFile(audioFile.absolutePath)
            prepare()
            start()
        }
    }

    private fun stopRecording() {
        recorder.apply {
            stop()
            release()
        }
    }

    companion object {
        init {
            System.loadLibrary("native-lib")
        }
    }
}

fun copyModelIfNeeded(context: Context) {
    val modelDir = File(context.filesDir, "models")
    if (!modelDir.exists()) {
        modelDir.mkdirs()
    }

    val modelFile = File(modelDir, "ggml-base.en.bin")
    if (!modelFile.exists()) {
        context.assets.open("models/ggml-base.en.bin").use { input ->
            FileOutputStream(modelFile).use { output ->
                input.copyTo(output)
            }
        }
    }

    Log.d("WHISPER", "Model path: ${modelFile.absolutePath}, exists: ${modelFile.exists()}")
}
