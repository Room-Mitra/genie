import android.app.DatePickerDialog
import android.app.TimePickerDialog
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import java.time.LocalDate
import java.time.LocalTime

fun DatePickerDialogWrapper(
    context: android.content.Context,
    initialDate: LocalDate,
    minDate: LocalDate,
    maxDate: LocalDate,
    onDateSelected: (LocalDate) -> Unit
) {
//    val context = LocalContext.current
    DatePickerDialog(
        context,
        { _, year, month, dayOfMonth ->
            onDateSelected(LocalDate.of(year, month + 1, dayOfMonth))
        },
        initialDate.year,
        initialDate.monthValue - 1,
        initialDate.dayOfMonth
    ).apply {
        datePicker.minDate = minDate.toEpochDay() * 24 * 60 * 60 * 1000
        datePicker.maxDate = maxDate.toEpochDay() * 24 * 60 * 60 * 1000
        show()
    }
}

fun TimePickerDialogWrapper(
    context: android.content.Context,
    initialTime: LocalTime,
    onTimeSelected: (LocalTime) -> Unit
) {
//    val context = LocalContext.current
    TimePickerDialog(
        context,
        { _, hour: Int, minute: Int ->
            onTimeSelected(LocalTime.of(hour, minute))
        },
        initialTime.hour,
        initialTime.minute,
        false
    ).show()
}
