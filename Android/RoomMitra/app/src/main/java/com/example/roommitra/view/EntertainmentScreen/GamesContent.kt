// GamesContent.kt
package com.example.roommitra.view

import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.VideogameAsset
import androidx.compose.material.icons.filled.Close
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties


data class GameItem(val name: String, val assetPath: String, val isLocal: Boolean = true)

@Composable
fun GamesContent() {
    val games = listOf(
        GameItem("Tower Builder", "https://iamkun.github.io/tower_game/", false),
        GameItem("Connect 4", "https://kenrick95.github.io/c4/", false),
        GameItem("Tic Tac Toe", "https://marcft.github.io/tic-tac-toe/", false),
        GameItem("2048", "games/2048/index.html"),
        GameItem("Clumsy Bird", "games/clumsybird/index.html"),
        GameItem("Pong", "games/pong/pong/index.html"),

    )

    var selectedGame by remember { mutableStateOf<GameItem?>(null) }

    LazyVerticalGrid(
        columns = GridCells.Fixed(4),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.fillMaxSize()
    ) {
        items(games) { game ->
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f) // square card
                    .clickable { selectedGame = game }
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        Icons.Filled.VideogameAsset,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(40.dp)
                    )
                    Spacer(Modifier.height(12.dp))
                    Text(
                        game.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }

    // Fullscreen WebView Dialog (same behavior as before)
    if (selectedGame != null) {
        Dialog(
            onDismissRequest = { selectedGame = null },
            properties = DialogProperties(usePlatformDefaultWidth = false)
        ) {
            AnimatedVisibility(
                visible = selectedGame != null,
                enter = slideInVertically(initialOffsetY = { it }),
                exit = slideOutVertically(targetOffsetY = { it })
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(MaterialTheme.colorScheme.background)
                ) {
                    Column(Modifier.fillMaxSize()) {
                        // Header with close button
                        Row(
                            Modifier
                                .fillMaxWidth()
                                .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f))
                                .padding(horizontal = 16.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                selectedGame!!.name,
                                Modifier.weight(1f),
                                style = MaterialTheme.typography.titleMedium
                            )
                            IconButton(
                                onClick = { selectedGame = null },
                                modifier = Modifier.size(36.dp)
                            ) {
                                Icon(Icons.Filled.Close, contentDescription = "Close")
                            }
                        }

                        // WebView loading local asset or remote URL depending on GameItem.isLocal
                        var webView: WebView? by remember { mutableStateOf(null) }
                        AndroidView(
                            factory = { context ->
                                WebView(context).apply {
                                    webViewClient = WebViewClient()
                                    settings.javaScriptEnabled = true
                                    settings.domStorageEnabled = true

                                    val urlToLoad = if (selectedGame!!.isLocal) {
                                        "file:///android_asset/${selectedGame!!.assetPath}"
                                    } else {
                                        selectedGame!!.assetPath
                                    }

                                    loadUrl(urlToLoad)
                                    webView = this
                                }
                            },
                            modifier = Modifier.fillMaxSize()
                        )
                        DisposableEffect(selectedGame) {
                            onDispose {
                                webView?.apply {
                                    stopLoading()
                                    loadUrl("about:blank")
                                    destroy()
                                }
                                webView = null
                            }
                        }
                    }
                }
            }
        }
    }
}
