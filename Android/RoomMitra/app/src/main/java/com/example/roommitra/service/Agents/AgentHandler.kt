// AgentHandler.kt
package com.example.roommitra.agent

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

interface AgentHandler {
    fun handle(parameters: List<String>, scope: CoroutineScope = CoroutineScope(Dispatchers.Main))
}
