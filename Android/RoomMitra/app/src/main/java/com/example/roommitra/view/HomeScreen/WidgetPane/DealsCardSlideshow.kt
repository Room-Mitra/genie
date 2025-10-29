package com.example.roommitra.view.WidgetPane

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.roommitra.service.PollingManager
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.json.JSONArray

data class Deal(
    val title: String,
    val imageUrl: String
)

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


    val displayDeals = if (deals.isNotEmpty()) deals else listOf()

    val pagerState = rememberPagerState(pageCount = { deals.size })
    val scope = rememberCoroutineScope()

    LaunchedEffect(pagerState.currentPage) {
        delay(30_000L)
        if (displayDeals.isNotEmpty()) {
            val nextPage = (pagerState.currentPage + 1) % displayDeals.size
            scope.launch { pagerState.animateScrollToPage(nextPage) }
        }
//        val nextPage = (pagerState.currentPage + 1) % deals.size
//        scope.launch { pagerState.animateScrollToPage(nextPage) }
    }
    if (displayDeals.isNotEmpty()) {
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
                    DealsCard(deals[page])
                }

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
}
