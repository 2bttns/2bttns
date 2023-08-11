const express = require('express');
const cors = require('cors'); 
const { TwoBttnsApi } = require("@2bttns/sdk");
const path = require('path');

const app = express();
const port = 3002;

const twobttns = new TwoBttnsApi({
  appId: "example-app",
  secret: "example-secret-value",
  url: "http://localhost:3001",
});

// Enable CORS for all routes
app.use(cors());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// If you want to explicitly serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/get-url', (req, res) => {
  const url = twobttns.generatePlayUrl({
    gameId: "example-game-0",
    playerId: "some-player-id",
    numItems: 5,
    callbackUrl: "https://example.com/callback",
  });

  res.json({ url });
});

app.get('/get-results', async (req, res) => {
  try {
    const { data } = await twobttns.callApi("/game-objects/ranked", "get", {
      playerId: "some-player-id",
      inputTags: "b90oii7qz04lqdr0gorosvp8",
      outputTag: "b90oii7qz04lqdr0gorosvp8",
    });

    res.json(data);
  } catch (error) {
    console.error('Error fetching game objects:', error);
    res.status(500).json({ error: 'Error fetching game objects' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
