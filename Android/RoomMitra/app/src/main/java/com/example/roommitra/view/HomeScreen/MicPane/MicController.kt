package com.example.roommitra.view

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import androidx.compose.runtime.*
import com.example.roommitra.ConversationMessage
import com.example.roommitra.MainActivity
import kotlinx.coroutines.delay
import java.util.*
import com.example.roommitra.service.rememberRecordAudioPermission

/**
 * Enum defining microphone states.
 * Each represents a distinct phase in the voice interaction lifecycle.
 */
enum class ListenState { Idle, Listening, Thinking, Speaking, Muted }

/**
 * MicController
 * --------------
 * Encapsulates all voice recognition logic, TTS synchronization, and conversation handling.
 * The UI layer (MicPane) observes [listenState] and [conversation] reactively.
 */
class MicController(
    private val ctx: Context,
    private val onFinalUtterance: (String) -> Unit
) {
    var listenState by mutableStateOf(ListenState.Idle)
        private set

    // Reference to shared conversation maintained in MainActivity
    val conversation = MainActivity.conversation

    private var speechRecognizer: SpeechRecognizer? = null
    private val ttsPlaying get() = MainActivity.isTtsPlaying.value

    /**
     * Initialize the SpeechRecognizer and attach a listener.
     * This sets up callbacks for recognition events, results, and errors.
     */
    fun initialize() {
        if (SpeechRecognizer.isRecognitionAvailable(ctx)) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(ctx).apply {
                setRecognitionListener(object : RecognitionListener {
                    override fun onReadyForSpeech(params: Bundle?) {}
                    override fun onBeginningOfSpeech() {}

                    // Called when the user stops speaking
                    override fun onEndOfSpeech() {
                        listenState = ListenState.Thinking
                    }

                    // Called when recognition fails or times out
                    override fun onError(error: Int) {
                        listenState = ListenState.Idle
                    }

                    // Final recognized results after user finishes speaking
                    override fun onResults(results: Bundle?) {
                        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        if (!matches.isNullOrEmpty()) {
                            conversation.add(ConversationMessage(matches[0], true))
                            onFinalUtterance(matches[0]) // Send recognized text to app logic
                        }
                    }

                    override fun onPartialResults(partialResults: Bundle?) {}
                    override fun onEvent(eventType: Int, params: Bundle?) {}
                    override fun onBufferReceived(buffer: ByteArray?) {}
                    override fun onRmsChanged(rmsdB: Float) {}
                })
            }
        }
    }

    /**
     * Start listening for speech input.
     * Configures the recognizer intent and begins capturing audio.
     */
    fun startListening() {
        listenState = ListenState.Listening
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        }
        speechRecognizer?.startListening(intent)
    }

    /**
     * Stop the speech recognizer manually.
     * Resets to Idle unless already transitioning to another state.
     */
    fun stopListening() {
        speechRecognizer?.stopListening()
        if (listenState == ListenState.Listening) {
            listenState = ListenState.Idle
        }
    }

    /**
     * Mute the system completely:
     * - Stops recognition
     * - Immediately halts TTS playback
     */
    fun mute() {
        listenState = ListenState.Muted
        MainActivity.stopTtsImmediately()
        stopListening()
    }

    /**
     * Unmute and reset back to idle, ready for user interaction.
     */
    fun unmute() {
        listenState = ListenState.Idle
    }

    /**
     * Cleanup to prevent memory leaks when the Composable is disposed.
     */
    fun dispose() {
        speechRecognizer?.destroy()
        speechRecognizer = null
        listenState = ListenState.Idle
    }

    /**
     * Clears the conversation automatically after [delayMillis] ms of inactivity.
     * Helps keep the chat lightweight and uncluttered.
     */
    suspend fun autoClearConversationAfter(delayMillis: Long = 60_000L) {
        if (conversation.isNotEmpty()) {
            delay(delayMillis)
            conversation.clear()
        }
    }

    /**
     * Sync TTS playback state with listening visuals.
     * Called whenever MainActivity updates [isTtsPlaying].
     */
    fun onTtsStateChanged(ttsPlaying: Boolean) {
        listenState = when {
            ttsPlaying && listenState != ListenState.Muted -> ListenState.Speaking
            !ttsPlaying && listenState == ListenState.Speaking -> ListenState.Idle
            else -> listenState
        }
    }
}

/**
 * rememberMicController
 * ---------------------
 * This is the composable-friendly wrapper for MicController.
 * It integrates the controller with Compose's lifecycle (remember, DisposableEffect, LaunchedEffect).
 */
@Composable
fun rememberMicController(
    onFinalUtterance: (String) -> Unit,
    autoListenTrigger: State<Long>
): MicController {
    val ctx = androidx.compose.ui.platform.LocalContext.current
    val controller = remember { MicController(ctx, onFinalUtterance) }

    // Handle microphone permission state
    val (hasRecordPerm, requestRecordPerm) = rememberRecordAudioPermission(
        onPermissionGranted = { controller.startListening() }
    )

    // Observe global TTS state from MainActivity
    val ttsPlaying by MainActivity.isTtsPlaying

    // Used to defer auto-listening until conditions are right
    var pendingAutoListen by remember { mutableStateOf(false) }

    /**
     * Initialize controller on composition start, clean up on dispose.
     */
    DisposableEffect(Unit) {
        controller.initialize()
        onDispose { controller.dispose() }
    }

    /**
     * Detect external trigger (from parent screen) to auto-start listening.
     * E.g., after a wake word or remote signal.
     */
    LaunchedEffect(autoListenTrigger.value) {
        if (autoListenTrigger.value != 0L) pendingAutoListen = true
    }

    /**
     * When pending auto-listen is true and system is not speaking,
     * begin listening automatically if permissions are granted.
     */
    LaunchedEffect(pendingAutoListen, ttsPlaying, controller.listenState) {
        if (pendingAutoListen && !ttsPlaying &&
            controller.listenState != ListenState.Listening &&
            controller.listenState != ListenState.Thinking &&
            controller.listenState != ListenState.Muted
        ) {
            if (hasRecordPerm.value) {
                controller.startListening()
            } else {
                requestRecordPerm()
            }
            pendingAutoListen = false
        }
    }

    /**
     * Keep MicController state synced with TTS state.
     */
    LaunchedEffect(ttsPlaying) {
        controller.onTtsStateChanged(ttsPlaying)
    }

    /**
     * Schedule auto-clearing of conversation after each new message.
     */
    LaunchedEffect(controller.conversation.size) {
        controller.autoClearConversationAfter()
    }

    return controller
}
