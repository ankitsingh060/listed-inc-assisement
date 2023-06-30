const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

class AuthController {
  constructor(userModel, view) {
    this.userModel = userModel;
    this.view = view;
  }

  configurePassport() {
    passport.use(
      new GoogleStrategy(
        {
          clientID: '96743617960-li0scmg21e7hjgrll275lvhjntiffe85.apps.googleusercontent.com',
          clientSecret: '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',
          callbackURL: '/auth/google/callback'
        },
        (accessToken, refreshToken, profile, done) => {
          const user = new this.userModel(accessToken, refreshToken);
          done(null, user);
        }
      )
    );

    passport.serializeUser((user, done) => {
      done(null, user);
    });

    passport.deserializeUser((user, done) => {
      done(null, user);
    });
  }

  authenticate() {
    return passport.authenticate('google', {
      scope: ['profile', 'https://www.googleapis.com/auth/gmail.modify']
    });
  }

  handleCallback() {
    return passport.authenticate('google', { failureRedirect: '/login' });
  }
}

module.exports = AuthController;
