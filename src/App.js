import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import { Helmet } from 'react-helmet';
import { Button, TextField, Typography, CssBaseline, Container, ThemeProvider, createTheme, Card, CardContent, Box, Link, IconButton, Alert } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import AlertTitle from '@mui/lab/AlertTitle';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const resetTime = moment.tz('Europe/Berlin').hour(4).minute(0).second(0);
      setTimeRemaining(moment.utc(moment(resetTime).diff(moment())).format("HH:mm:ss"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setCredits(null); // Clear the previous response
    if (!apiKey.startsWith('nv-') || apiKey.length !== 51) {
      setError({
        code: 418,
        message: "Invalid or inactive NovaAI API key!",
        tip: "Create a new NovaOSS API key or reactivate your account.",
        website: "https://nova-oss.com",
        by: "NovaOSS/Nova-API"
      });
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get('https://api.nova-oss.com/v1/account/credits', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      setCredits(response.data.credits);
      setError(null);
    } catch (error) {
      setError(error.response.data.error);
    } finally {
      setLoading(false);
    }
  };

  const remainingRequests = {
    'GPT-3': credits ? Math.floor(credits / 3) : '-',
    'GPT-4': credits ? Math.floor(credits / 30) : '-',
    'Other': credits ? Math.floor(credits / 10) : '-',
  };

  const resetTime = moment.tz('Europe/Berlin').hour(4).minute(0).second(0);
  const localResetTime = resetTime.clone().local().format('LT');
  const timezoneOffset = moment().format('Z'); // Get the timezone offset

  const theme = createTheme({
    palette: {
      mode: 'dark', // This line changes the theme to dark mode
      primary: {
        main: '#3f51b5',
      },
      secondary: {
        main: '#f44336',
      },
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Helmet>
        <title>Nova Credit Checker</title>
        <meta name="description" content="A simple app to check your Nova credits" />
      </Helmet>
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>Nova Credit Checker</Typography>
        <Typography variant="h6" align="center" gutterBottom>A simple app to check your Nova credits</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="API Key"
            variant="filled"
            fullWidth
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" type="submit" disabled={loading} fullWidth sx={{ borderRadius: 50, p: 1 }}>
            {loading ? 'Loading...' : 'Check Nova Credits'}
          </Button>
        </form>
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            <AlertTitle>Error</AlertTitle>
            {error.message} - <strong>{error.tip}</strong>
            <br />
            <Link href={error.website} target="_blank" rel="noopener">Visit NovaOSS</Link>
          </Alert>
        )}
        {credits !== null && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" align="center" color="primary">Remaining Nova credits: {credits}</Typography>
              <Typography variant="h6" align="center" color="secondary">You can make:</Typography>
              {Object.entries(remainingRequests).map(([service, requests]) => (
                <Typography key={service} variant="body1" align="center">
                  {requests} more {service} requests
                </Typography>
              ))}
            </CardContent>
          </Card>
        )}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="h5">Nova credits reset at {localResetTime} your local time ({timezoneOffset} GMT).</Typography>
          <Typography variant="h5">Time remaining until next reset: {timeRemaining}</Typography>
        </Box>
      </Container>
      <Box sx={{ mt: 3, textAlign: 'center', position: 'absolute', bottom: 0, width: '100%' }}> {/* This line moves the GitHub section to the bottom */}
        <Link href="https://github.com/aaxyat/nova-credits" target="_blank" rel="noopener" color="inherit">
          <IconButton>
            <GitHubIcon />
          </IconButton>
          Check this project on GitHub
        </Link>
      </Box>
    </ThemeProvider>
  );
}

export default App;
