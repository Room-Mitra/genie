// GamesContent.kt
package com.example.roommitra.view

import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import coil.compose.AsyncImage
import androidx.compose.ui.layout.ContentScale

data class GameItem(
    val name: String,
    val assetPath: String,
    val isLocal: Boolean = true,
    val imageUrl: String
)

@Composable
fun GamesContent() {
    val games = listOf(
        GameItem(
            "Tower Building",
            "https://iamkun.github.io/tower_game/",
            false,
            "https://riseuplabs.com/wp-content/uploads/2021/03/promotional-banner-tower-building-game-riseup-labs-gaming-platform.jpg"
        ),
        GameItem(
            "Connect 4",
            "https://kenrick95.github.io/c4/",
            false,
            "https://toybook.com/wp-content/uploads/sites/4/2024/02/EASTPOINT-SPORTS_GIANT-SIZED-CONNECT-4_TI_2024.webp"
        ),
        GameItem(
            "Tic Tac Toe",
            "https://marcft.github.io/tic-tac-toe/",
            false,
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCVGxn911Cx4EkYY0wv78qLfOBS6ftWRKf52MiN9ssipwVaknn0kFcHQ3MngoYB2SNi14&usqp=CAU"
        ),
        GameItem(
            "2048",
            "games/2048/index.html",
            true,
            "https://img.poki-cdn.com/cdn-cgi/image/q=78,scq=50,width=204,height=204,fit=cover,f=auto/cb8c967c-4a78-4ffa-8506-cbac69746f4f/2048.png"
        ),
        GameItem(
            "Clumsy Bird",
            "games/clumsybird/index.html",
            true,
            "https://i.imgur.com/Slbvt65.png"
        ),
        GameItem(
            "Pong",
            "games/pong/pong/index.html",
            true,
            "https://freepong.org/images/pong-game-card.png"
        )
    )

    var selectedGame by remember { mutableStateOf<GameItem?>(null) }

    LazyVerticalGrid(
        columns = GridCells.Fixed(4),
        verticalArrangement = Arrangement.spacedBy(20.dp),
        horizontalArrangement = Arrangement.spacedBy(20.dp),
        modifier = Modifier
            .fillMaxSize()
            .padding(12.dp)
    ) {
        items(games) { game ->
            Card(
                shape = RoundedCornerShape(16.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f)
                    .clickable(
                        indication = null,
                        interactionSource = remember { MutableInteractionSource() }
                    ) { selectedGame = game }
            ) {
                Box(modifier = Modifier.fillMaxSize()) {
                    AsyncImage(
                        model = game.imageUrl,
                        contentDescription = game.name,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )

                    // Gradient overlay at bottom
                    Box(
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .fillMaxWidth()
                            .height(70.dp)
                            .background(
                                Brush.verticalGradient(
                                    colors = listOf(
                                        Color.Transparent,
                                        Color.Black.copy(alpha = 0.8f)
                                    )
                                )
                            )
                    )

                    // Bigger Game title
                    Text(
                        text = game.name,
                        style = MaterialTheme.typography.titleLarge.copy(
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp,
                            fontSize = 22.sp
                        ),
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .padding(12.dp)
                    )
                }
            }
        }
    }

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
                                style = MaterialTheme.typography.titleLarge
                            )
                            IconButton(
                                onClick = { selectedGame = null },
                                modifier = Modifier.size(40.dp)
                            ) {
                                Icon(Icons.Filled.Close, contentDescription = "Close")
                            }
                        }

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
