// NotificationStack.js
import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';

const StyledSnackbar = styled(Snackbar)(({ theme, index }) => ({
  marginBottom: theme.spacing(8 * index), // Stack notifications vertically
}));

const NotificationStack = ({ notifications, onClose }) => {
  return (
    <>
      {notifications.map((notification, index) => (
        <StyledSnackbar
          key={notification.id}
          index={index}
          open={notification.open}
          autoHideDuration={notification.autoHideDuration}
          onClose={() => onClose(notification.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={() => onClose(notification.id)}
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </MuiAlert>
        </StyledSnackbar>
      ))}
    </>
  );
};

export default NotificationStack;