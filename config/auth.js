const auth = {}

auth.isUserLoggedIn = (req, res, next) => {
    if (req.isAuthenticated() && (req.user.type === "USER")) return next();
    req.flash('error_msgs', 'Please log in to access this page');
    res.redirect('/login');
};

module.exports = auth;
