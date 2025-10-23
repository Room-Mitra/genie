// AgenticHandler.kt
package com.example.roommitra.agent

import android.content.Context
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers

class AgenticHandlerRegistry(context: Context) {

    private val handlers: Map<String, AgentHandler> = mapOf(
        "Music" to MusicAgentHandler(context)
        // Add other handlers here:
        // "RoomService" to RoomServiceAgentHandler(context)
    )

    fun callAgent(agentType: String, parameters: List<String>, scope: CoroutineScope = CoroutineScope(Dispatchers.Main)) {
        val handler = handlers[agentType]
        if (handler != null) {
            handler.handle(parameters, scope)
        } else {
            Log.w("AgenticHandler", "No handler found for agent type: $agentType")
        }
    }
}
