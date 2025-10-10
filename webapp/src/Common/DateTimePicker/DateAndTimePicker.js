import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import TextField from '@mui/material/TextField';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import dayjs from 'dayjs';

export const DateAndTimePicker = ({ dateTimeState }) => {
  const [dateTime, setDateTime] = dateTimeState; //React.useState(null);

  const onChange = (newValue) => {
    console.log(newValue.toDate());
    setDateTime(newValue.toDate());
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateTimePicker
        label="Date and Time"
        value={dayjs(dateTime)}
        onChange={onChange}
        renderInput={(params) => <TextField {...params} />}
        defaultValue={dayjs(dateTime)}
      />
    </LocalizationProvider>
  );
};

// export default DateAndTimePicker;
