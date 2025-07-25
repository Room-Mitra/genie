package com.example.voiceassistant

import android.Manifest
import android.content.pm.PackageManager
import android.media.MediaRecorder
import android.os.Bundle
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.MotionEvent
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import java.io.File

class MainActivity : AppCompatActivity() {

    private var recorder: MediaRecorder? = null
    private var isRecording = false
    private var recordingStartTime = 0L

    private val RECORD_AUDIO_PERMISSION_CODE = 200

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val button = findViewById<Button>(R.id.sttButton)

        // Check and request permission on startup
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
            != PackageManager.PERMISSION_GRANTED
        ) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.RECORD_AUDIO),
                RECORD_AUDIO_PERMISSION_CODE
            )
        }

        button.setOnTouchListener { v, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                        == PackageManager.PERMISSION_GRANTED
                    ) {
                        startRecording()
                    } else {
                        Log.w("VoiceAssistant", "Permission not granted")
                        ActivityCompat.requestPermissions(
                            this,
                            arrayOf(Manifest.permission.RECORD_AUDIO),
                            RECORD_AUDIO_PERMISSION_CODE
                        )
                    }
                    true
                }

                MotionEvent.ACTION_UP -> {
                    stopRecording()
                    v.performClick()
                    true
                }

                else -> false
            }
        }
    }

    private fun startRecording() {
        val outputPath = getExternalFilesDir(null)?.absolutePath + "/recording.mp4"
        Log.d("VoiceAssistant", "Output file path: $outputPath")

        recorder = MediaRecorder().apply {
            try {
                setAudioSource(MediaRecorder.AudioSource.MIC)
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setAudioEncodingBitRate(128000)
                setAudioSamplingRate(44100)
                setOutputFile(outputPath)

                Log.d("VoiceAssistant", "Preparing...")
                prepare()
                Log.d("VoiceAssistant", "Starting...")
                start()

                isRecording = true
                recordingStartTime = System.currentTimeMillis()
                Log.d("VoiceAssistant", "Recording started")
            } catch (e: Exception) {
                Log.e("VoiceAssistant", "startRecording() failed: ${e.message}")
                e.printStackTrace()
                release()
                recorder = null
                isRecording = false
            }
        }
    }

    private fun stopRecording() {
        if (!isRecording || recorder == null) {
            Log.w("VoiceAssistant", "Not recording, nothing to stop")
            return
        }

        val elapsed = System.currentTimeMillis() - recordingStartTime
        if (elapsed < 1000) {
            Log.d("VoiceAssistant", "Delaying stop by ${1000 - elapsed}ms")
            Handler(Looper.getMainLooper()).postDelayed({
                actuallyStopRecording()
            }, 1000 - elapsed)
        } else {
            actuallyStopRecording()
        }
    }

    private fun actuallyStopRecording() {
        try {
            recorder?.stop()
            Log.d("VoiceAssistant", "Recording stopped")
        } catch (e: RuntimeException) {
            Log.e("VoiceAssistant", "stop() failed: ${e.message}")
            e.printStackTrace()
        } finally {
            recorder?.release()
            recorder = null
            isRecording = false

            val file = File(getExternalFilesDir(null), "recording.mp4")
            Log.d("VoiceAssistant", "File saved: ${file.absolutePath}, size: ${file.length()} bytes")
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == RECORD_AUDIO_PERMISSION_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Log.d("VoiceAssistant", "Permission granted by user")
            } else {
                Log.e("VoiceAssistant", "Permission denied by user")
            }
        }
    }
}
