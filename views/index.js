class View {
    showLoginPage() {
      return '<a href="/auth/google">Login with Google</a>';
    }
  
    showSequenceStartedPage() {
      return 'Sequence started!';
    }
  }
  
  module.exports = View;
  