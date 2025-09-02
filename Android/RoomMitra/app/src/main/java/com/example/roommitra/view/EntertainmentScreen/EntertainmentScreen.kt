package com.example.roommitra.view

import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items

enum class EntertainmentSection(val displayName: String) {
    Games("Games"),
    Music("Music"),
    Movie("Movie")
}

data class GameItem(val name: String, val assetPath: String, val isLocal: Boolean = true)

@Composable
fun EntertainmentScreen(
    onBackClick: () -> Unit
) {
    var selectedSection by remember { mutableStateOf(EntertainmentSection.Games) }

    Row(Modifier.fillMaxSize()) {
        // Left menu
        Column(
            modifier = Modifier
                .width(150.dp)
                .fillMaxHeight()
                .background(MaterialTheme.colorScheme.surface)
                .padding(top = 24.dp),
            verticalArrangement = Arrangement.Top,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            IconButton(onClick = onBackClick) {
                Icon(Icons.Filled.ArrowBack, contentDescription = "Back")
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Menu items
            EntertainmentSection.values().forEach { section ->
                val isSelected = section == selectedSection
                Text(
                    text = section.displayName,
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                    color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp)
                        .clickable { selectedSection = section }
                        .background(
                            if (isSelected) MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
                            else Color.Transparent,
                            RoundedCornerShape(8.dp)
                        )
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                )
            }
        }

        // Right content area
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(24.dp)
        ) {
            when (selectedSection) {
                EntertainmentSection.Games -> GamesContent()
                EntertainmentSection.Music -> MusicContent()
                EntertainmentSection.Movie -> MovieContent()
            }
        }
    }
}

@Composable
fun GamesContent() {
    val games = listOf(
        GameItem("Space Race", "https://hexgl.bkcore.com/play/", false),
        GameItem("Tower Builder", "https://iamkun.github.io/tower_game/", false),
        GameItem("Connect 4", "https://kenrick95.github.io/c4/",false),
        GameItem("2048", "games/2048/index.html"),
        GameItem("Clumsy Bird", "games/clumsybird/index.html"),
        GameItem("Pacman", "games/pacman/index.htm"),
        GameItem("Simon Says", "https://weslley.co/react-simon-says/",false)
    )

    var selectedGame by remember { mutableStateOf<GameItem?>(null) }

    LazyVerticalGrid(
        columns = GridCells.Fixed(4), // 2 cards per row
        verticalArrangement = Arrangement.spacedBy(8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.fillMaxSize()
    ) {
        items(games) { game ->
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f) // makes card square
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

    // Fullscreen WebView Dialog
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

                        // WebView loading local asset
                        var webView: WebView? by remember { mutableStateOf(null) }
                        AndroidView(
                            factory = { context ->
                                WebView(context).apply {
                                    webViewClient = WebViewClient()
                                    settings.javaScriptEnabled = true
                                    settings.domStorageEnabled = true
//                                    loadUrl("file:///android_asset/${selectedGame!!.assetPath}")
                                    val urlToLoad = if (selectedGame!!.isLocal) {
                                        "file:///android_asset/${selectedGame!!.assetPath}"
                                    } else {
                                        selectedGame!!.assetPath // load directly from web
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

@Composable
fun MusicContent() {
    Text("Music Section Content", style = MaterialTheme.typography.headlineMedium)
}

@Composable
fun MovieContent() {
    Text("Movie Section Content", style = MaterialTheme.typography.headlineMedium)
}
