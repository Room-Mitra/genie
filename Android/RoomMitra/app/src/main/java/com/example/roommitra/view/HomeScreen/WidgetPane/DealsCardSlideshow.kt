package com.example.roommitra.view.WidgetPane

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.ExperimentalAnimationApi
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.with
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.example.roommitra.service.PollingManager
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.json.JSONArray
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.LocalTime
data class Deal(
    val title: String,
    val imageUrl: String
)


sealed class SlideshowItem {
    data class DealItem(val deal: Deal) : SlideshowItem()
    object InfoItem : SlideshowItem() // merged Time + Weather
}


@OptIn(ExperimentalFoundationApi::class)
@Composable
fun DealsCardSlideshow() {
    val hotelInfoRepo = PollingManager.getHotelInfoRepository()
    val hotelData by hotelInfoRepo.hotelData.collectAsState()

    // Extract promotions.carousel.cards
    val promotionsObj = hotelData?.optJSONObject("promotions")
    val carouselObj = promotionsObj?.optJSONObject("carousel")
    val cardsArray = carouselObj?.optJSONArray("cards")

    // Convert to list of Deal objects
    val deals = remember(cardsArray?.toString()) {
        val list = mutableListOf<Deal>()
        if (cardsArray != null) {
            for (i in 0 until cardsArray.length()) {
                val card = cardsArray.optJSONObject(i)
                val title = card?.optString("title").orEmpty()
                val imageUrl = card?.optJSONObject("asset")?.optString("url").orEmpty()
                if (title.isNotEmpty() && imageUrl.isNotEmpty()) {
                    list.add(Deal(title, imageUrl))
                }
            }
        }
        list
    }

    // Merge deals + widgets
    val slideshowItems = remember(deals) {
        buildList {
            add(SlideshowItem.InfoItem)
            addAll(deals.map { SlideshowItem.DealItem(it) })
        }
    }


    if (slideshowItems.isEmpty()) return

    val pagerState = rememberPagerState(pageCount = { slideshowItems.size })
    val scope = rememberCoroutineScope()

    // Auto-scroll every 30 seconds
    LaunchedEffect(pagerState.currentPage, slideshowItems.size) {
        delay(30_000L)
        val nextPage = (pagerState.currentPage + 1) % slideshowItems.size
        scope.launch { pagerState.animateScrollToPage(nextPage) }
    }

    Card(
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp)
            .height(450.dp)
    ) {
        Box {
            HorizontalPager(state = pagerState, modifier = Modifier.fillMaxSize()) { page ->
                when (val item = slideshowItems[page]) {
                    is SlideshowItem.DealItem -> DealsCard(item.deal)
                    is SlideshowItem.InfoItem -> InfoCard()
                }
            }

            // Pager indicators
            Row(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(8.dp),
                horizontalArrangement = Arrangement.Center
            ) {
                repeat(pagerState.pageCount) { index ->
                    val isSelected = pagerState.currentPage == index
                    Box(
                        modifier = Modifier
                            .padding(4.dp)
                            .size(if (isSelected) 10.dp else 8.dp)
                            .background(
                                if (isSelected) MaterialTheme.colorScheme.primary
                                else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                                shape = RoundedCornerShape(50)
                            )
                    )
                }
            }
        }
    }
}

@Composable
fun DealsCard(deal: Deal) {
    Box {
        AsyncImage(
            model = deal.imageUrl,
            contentDescription = deal.title,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomStart)
                .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.7f))
                .padding(14.dp)
        ) {
            Text(
                deal.title,
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}



@OptIn(ExperimentalAnimationApi::class)
@Composable
fun InfoCard() {
    val time by produceState(initialValue = LocalTime.now()) {
        while (true) {
            value = LocalTime.now()
            delay(1000L)
        }
    }

    // Dynamic background gradient based on time of day
    val hour = time.hour
    val gradientColors = when (hour) {
        in 5..7 -> listOf(Color(0xFFFFB75E), Color(0xFFED8F03)) // Morning
        in 8..16 -> listOf(Color(0xFF56CCF2), Color(0xFF2F80ED)) // Day
        in 17..19 -> listOf(Color(0xFFFF512F), Color(0xFFF09819)) // Evening
        else -> listOf(Color(0xFF141E30), Color(0xFF243B55)) // Night
    }

    // Smooth gradient animation
    val infiniteTransition = rememberInfiniteTransition(label = "bgAnim")
    val shift by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            tween(8000, easing = LinearEasing),
            RepeatMode.Reverse
        ),
        label = "bgShift"
    )

    val brush = Brush.linearGradient(
        colors = gradientColors,
        start = Offset(0f, 0f),
        end = Offset(1000f * shift, 1000f)
    )

    // Time formatting
    val formattedTime = time.format(DateTimeFormatter.ofPattern("hh:mm"))
    val formattedSeconds = time.format(DateTimeFormatter.ofPattern("ss"))
    val amPm = time.format(DateTimeFormatter.ofPattern("a"))

    // Fake weather (replace with real data later)
    val temp = "27°C"
    val condition = "Partly Cloudy"
    val weatherIcon = Icons.Default.WbSunny

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(brush),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {

            // Weather section
//            Row(verticalAlignment = Alignment.CenterVertically) {
//                Icon(
//                    imageVector = weatherIcon,
//                    contentDescription = null,
//                    tint = Color.White,
//                    modifier = Modifier.size(36.dp)
//                )
//                Spacer(modifier = Modifier.width(8.dp))
//                Text(
//                    text = "$temp • $condition",
//                    style = MaterialTheme.typography.titleLarge.copy(
//                        fontWeight = FontWeight.Medium,
//                        color = Color.White.copy(alpha = 0.9f)
//                    )
//                )
//            }

            Spacer(modifier = Modifier.height(16.dp))

            // Time section
            Row(verticalAlignment = Alignment.Bottom) {
                AnimatedContent(
                    targetState = formattedTime,
                    transitionSpec = {
                        (slideInVertically { it / 2 } + fadeIn()) with
                                (slideOutVertically { -it / 2 } + fadeOut())
                    },
                    label = "timeAnim"
                ) { displayTime ->
                    Text(
                        text = displayTime,
                        style = MaterialTheme.typography.displayLarge.copy(
                            fontWeight = FontWeight.Bold
                        ),
                        color = Color.White,
                        textAlign = TextAlign.Center
                    )
                }

                Spacer(modifier = Modifier.width(6.dp))

                AnimatedContent(
                    targetState = formattedSeconds,
                    transitionSpec = {
                        (slideInVertically { it / 2 } + fadeIn()) with
                                (slideOutVertically { -it / 2 } + fadeOut())
                    },
                    label = "secondsAnim"
                ) { secs ->
                    Text(
                        text = secs,
                        style = MaterialTheme.typography.headlineSmall.copy(
                            fontWeight = FontWeight.Medium,
                            color = Color.White.copy(alpha = 0.85f)
                        ),
                        modifier = Modifier.padding(bottom = 14.dp)
                    )
                }

                Spacer(modifier = Modifier.width(14.dp))

                Text(
                    text = amPm,
                    style = MaterialTheme.typography.headlineSmall.copy(
                        fontWeight = FontWeight.Medium,
                        color = Color.White.copy(alpha = 0.85f)
                    ),
                    modifier = Modifier.padding(bottom = 14.dp)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Date
            Text(
                text = LocalDate.now().format(DateTimeFormatter.ofPattern("EEEE, d MMMM")),
                style = MaterialTheme.typography.bodyLarge.copy(
                    fontWeight = FontWeight.Medium,
                    color = Color.White.copy(alpha = 0.8f)
                ),
                textAlign = TextAlign.Center
            )
        }
    }
}

