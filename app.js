const express = require('express');
const session = require('express-session');
const passport = require('passport');
const User = require('./models/user');
const View = require('./views/index');
const AuthController = require('./controllers/authController');
const SequenceController = require('./controllers/sequenceController');

const app = express();
const userModel = User;
const view = new View();
const authController = new AuthController(userModel, view);
const sequenceController = new SequenceController(userModel);

// Configure Passport and session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport and routes
authController.configurePassport();

app.get('/', (req, res) => {
  res.send(view.showLoginPage());
});

app.get('/auth/google', authController.authenticate());

app.get(
  '/auth/google/callback',
  authController.handleCallback(),
  sequenceController.startSequence.bind(sequenceController)
);

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
