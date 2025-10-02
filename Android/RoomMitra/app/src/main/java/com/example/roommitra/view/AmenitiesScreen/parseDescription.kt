import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle

// Parses description with <Bold>, <Primary>, <Tertiary> tags
@Composable
fun parseDescription(desc: String): AnnotatedString {
    val builder = AnnotatedString.Builder()
    var cursor = 0
    val regex = Regex("<(Bold|Primary|Tertiary)>(.*?)</\\1>")

    regex.findAll(desc).forEach { match ->
        // Add text before match
        if (cursor < match.range.first) {
            builder.append(desc.substring(cursor, match.range.first))
        }

        val tag = match.groupValues[1]
        val content = match.groupValues[2]

        val style = when (tag) {
            "Bold" -> SpanStyle(fontWeight = FontWeight.Bold)
            "Primary" -> SpanStyle(
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
            "Tertiary" -> SpanStyle(
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.tertiary
            )
            else -> SpanStyle()
        }

        builder.withStyle(style) { append(content) }

        cursor = match.range.last + 1
    }

    // Add remaining text
    if (cursor < desc.length) {
        builder.append(desc.substring(cursor))
    }

    return builder.toAnnotatedString()
}