const { google } = require('googleapis');

class User {
  constructor(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  async getGmailClient() {
    const oAuth2Client = new google.auth.OAuth2();
    oAuth2Client.setCredentials({
      access_token: this.accessToken,
      refresh_token: this.refreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    return gmail;
  }
}

module.exports = User;
