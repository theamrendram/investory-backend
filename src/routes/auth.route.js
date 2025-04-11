// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require('fs');
const CLIENT_ID = process.env.UPSTOX_API_KEY;
const REDIRECT_URI = process.env.UPSTOX_REDIRECT_URI;

router.get("/login", (req, res) => {
  const upstoxAuthURL = `https://api.upstox.com/v2/login/authorization/dialog?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
  res.redirect(upstoxAuthURL);
});


router.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post('https://api.upstox.com/v2/login/authorization/token', null, {
      params: {
        code,
        client_id: process.env.UPSTOX_API_KEY,
        client_secret: process.env.UPSTOX_API_SECRET,
        redirect_uri: process.env.UPSTOX_REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token } = response.data;

    // Save to file
    fs.writeFileSync('.upstox_token.json', JSON.stringify({
      access_token,
      saved_at: new Date().toISOString()
    }, null, 2));

    console.log('✅ Access token saved!');
    res.send('Access token saved successfully!');
  } catch (error) {
    console.error('Token exchange failed', error.response?.data || error.message);
    res.status(500).send('Token exchange failed');
  }
});

module.exports = router;


module.exports = router;
