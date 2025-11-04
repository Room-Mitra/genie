package com.example.roommitra.view

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.sp
import kotlin.collections.isNotEmpty
import kotlin.text.isNotEmpty
import kotlin.text.last

@Composable
fun parseStyle(desc: String): AnnotatedString {
    val builder = AnnotatedString.Builder()

    val tagRegex = Regex(
        "<(h1|h2|h3|p|b|i|u|ul|li|table|tr|th|td)>([\\s\\S]*?)</\\1>",
        setOf(RegexOption.IGNORE_CASE, RegexOption.DOT_MATCHES_ALL)
    )

    @Composable
    fun styleForTag(tag: String): SpanStyle = when (tag.lowercase()) {
        "h1" -> SpanStyle(fontSize = 22.sp, fontWeight = FontWeight.Bold)
        "h2" -> SpanStyle(fontSize = 20.sp, fontWeight = FontWeight.SemiBold)
        "h3" -> SpanStyle(fontSize = 18.sp, fontWeight = FontWeight.Medium)
        "b" -> SpanStyle(fontWeight = FontWeight.Bold)
        "i" -> SpanStyle(fontStyle = FontStyle.Italic)
        "u" -> SpanStyle(textDecoration = TextDecoration.Underline)
        "th" -> SpanStyle(fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        else -> SpanStyle()
    }

    fun mergeStyles(parent: SpanStyle?, child: SpanStyle): SpanStyle {
        val p = parent ?: SpanStyle()
        return p.merge(child)
    }

    @Composable
    fun appendWithTags(text: String, currentStyle: SpanStyle? = null) {
        var lastIndex = 0
        val matches = tagRegex.findAll(text)

        for (match in matches) {
            if (match.range.first > lastIndex) {
                val before = text.substring(lastIndex, match.range.first)
                if (before.isNotBlank()) {
                    if (currentStyle != null)
                        builder.withStyle(currentStyle) { append(before) }
                    else builder.append(before)
                }
            }

            val tag = match.groupValues[1].lowercase()
            val inner = match.groupValues[2].trim()
            val merged = mergeStyles(currentStyle, styleForTag(tag))

            when (tag) {
                "h1", "h2", "h3", "p" -> {
                    builder.append("\n")
                    builder.withStyle(merged) { appendWithTags(inner, merged) }
                    builder.append("\n") // only one line break now
                }

                "ul" -> {
                    builder.append("\n")
                    appendWithTags(inner, merged)
                }

                "li" -> {
                    builder.append(" • ")
                    builder.withStyle(merged) { appendWithTags(inner, merged) }
                    builder.append("\n") // single line break per list item
                }

                "table" -> {
                    builder.append("\n")
                    val rowRegex = Regex("<tr>([\\s\\S]*?)</tr>", RegexOption.IGNORE_CASE)
                    val rows = rowRegex.findAll(inner)

                    val tableData = rows.map { row ->
                        val cellRegex = Regex("<(th|td)>([\\s\\S]*?)</\\1>", RegexOption.IGNORE_CASE)
                        cellRegex.findAll(row.groupValues[1]).map { match ->
                            match.groupValues[1].lowercase() to match.groupValues[2].trim()
                        }.toList()
                    }.toList()

                    val columnWidths = if (tableData.isNotEmpty()) {
                        val cols = tableData.maxOf { it.size }
                        (0 until cols).map { col ->
                            tableData.maxOfOrNull {
                                it.getOrNull(col)?.second?.replace(Regex("<.*?>"), "")?.length ?: 0
                            } ?: 0
                        }
                    } else emptyList()

                    val tableBase = SpanStyle(
                        fontFamily = FontFamily.Monospace,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    val headerStyle = tableBase.copy(fontWeight = FontWeight.Bold)

                    val totalWidth = columnWidths.sum() + (3 * columnWidths.size)
                    builder.withStyle(tableBase) { append("─".repeat(totalWidth) + "\n") }

                    tableData.forEachIndexed { rowIndex, row ->
                        row.forEachIndexed { colIndex, (tagType, cellText) ->
                            val cleanText = cellText.replace(Regex("<.*?>"), "").trim()
                            val padded = cleanText.padEnd(columnWidths[colIndex] + 3, ' ')
                            val cellStyle = if (tagType == "th") headerStyle else tableBase

                            builder.withStyle(cellStyle) { append(padded) }
                            if (colIndex < row.lastIndex) builder.withStyle(tableBase) { append("| ") }
                        }
                        builder.append("\n")
                        if (rowIndex == 0 || rowIndex == tableData.lastIndex)
                            builder.withStyle(tableBase) { append("─".repeat(totalWidth) + "\n") }
                    }
                    builder.append("\n")
                }

                else -> builder.withStyle(merged) { appendWithTags(inner, merged) }
            }
            lastIndex = match.range.last + 1
        }

        if (lastIndex < text.length) {
            val rest = text.substring(lastIndex)
            if (rest.isNotBlank()) {
                if (currentStyle != null)
                    builder.withStyle(currentStyle) { append(rest) }
                else builder.append(rest)
            }
        }
    }

    appendWithTags(desc.trim())
    return builder.toAnnotatedString()
}

// Helper extensions
private fun AnnotatedString.Builder.isNotEmpty(): Boolean =
    this.toAnnotatedString().text.isNotEmpty()

private fun AnnotatedString.Builder.last(): Char {
    val s = this.toAnnotatedString().text
    return if (s.isEmpty()) '\u0000' else s.last()
}