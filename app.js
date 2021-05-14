const express = require('express');
const passport = require('passport');
const bcrypt = require("bcryptjs");
const fetch = require('node-fetch');
const session = require("express-session");
const flash = require("connect-flash");
const bodyParser = require('body-parser');
require('dotenv').config();
const mongoose = require('mongoose');
const app = express();
const User = require('./models/user');
const auth = require("./config/auth");

require("./config/passport")(passport);

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_CONNECTION_STRING, {
     dbName: 'imdb',
     useNewUrlParser: true,
     useFindAndModify: false,
     useCreateIndex: true,
     useUnifiedTopology: true,
 })
    .then(()=>{
        console.log("database connected!")
    })
    .catch(err=>console.log(err));

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/images"));
app.use(express.urlencoded({
	extended: true
}));

app.use(
    session({
        secret: process.env.SECRET,
        resave: true,
        saveUninitialized: true
    })
);
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.success_msgs = req.flash("success_msgs");
    res.locals.error_msgs = req.flash("error_msgs");
    next();
});


app.get('/',async(req,res)=>{
    const imdbIDs = ['tt0330373','tt4154756','tt4154796','tt2395427','tt1260572','tt2313197','tt3501632','tt0944947','tt10090796','tt0371746','tt0096251','tt4154664','tt2247732','tt13650480','tt0372784','tt0103776','tt4007494','tt2768802','tt1483025','tt0077031'];
    const movies = [];
    for(var i=0;i<imdbIDs.length;i++){
        const response  = await fetch(`http://www.omdbapi.com/?i=${imdbIDs[i]}&apikey=${process.env.API_KEY}`);
        const movie = await response.json();
        movies.push(movie);
    }
    res.render("homepage",{movies:movies});
})

app.get("/userhome",  auth.isUserLoggedIn , async(req, res) => {
    const imdbIDs = ['tt0330373','tt4154756','tt4154796','tt2395427','tt1260572','tt2313197','tt3501632','tt0944947','tt10090796','tt0371746','tt0096251','tt4154664','tt2247732','tt13650480','tt0372784','tt0103776','tt4007494','tt2768802','tt1483025','tt0077031'];
    const movies = [];
    for(var i=0;i<imdbIDs.length;i++){
        const response  = await fetch(`http://www.omdbapi.com/?i=${imdbIDs[i]}&apikey=${process.env.API_KEY}`);
        const movie = await response.json();
        movies.push(movie);
    }
    res.render("new_home",{movies:movies});
});

app.get('/search', auth.isUserLoggedIn, async(req,res)=>{
    var query = req.query.search;
    const response  = await fetch(`http://www.omdbapi.com/?s=${query}&apikey=${process.env.API_KEY}`);
    const movies = await response.json();
    console.log(movies);
    if(movies.Response === 'False'){
        res.redirect('/userhome');
        // console.log(movie);
    }
    else{
        res.render("search",{movies:movies});
    }
});

app.get('/view/:id', auth.isUserLoggedIn, async(req,res)=>{
    const response  = await fetch(`http://www.omdbapi.com/?i=${req.params.id}&apikey=${process.env.API_KEY}`);
    const movie = await response.json();
    console.log(movie);
    if(movie.Response === 'False'){
        res.redirect('/userhome');
        // console.log(movie);
    }
    else{
        res.render("movie",{movie:movie});
    }
});

app.get('/search/:id', auth.isUserLoggedIn, async(req,res)=>{
    var movieID = req.params.id;
    const response  = await fetch(`http://www.omdbapi.com/?i=${movieID}&apikey=${process.env.API_KEY}`);
    const movie = await response.json();
    if(movie.Title === ''){
        res.redirect('back');
    }
    else{
        res.render("movie",{movie: movie});
    }
});

app.post('/addFavourite/:id', auth.isUserLoggedIn, (req,res)=>{
    User.findById(req.user._id)
        .then(user=>{
            var obj = {
                imdbID : req.params.id,
                comments : []
            }
            user.favourites.push(obj);
            user.save()
                .then(data => {
                    console.log("successfully added to favourites!");
                    req.flash("success_msgs","successfully added to favourites!");
                    res.redirect("back");
                })
        })
        .catch(err=>{
            console.log(err);
            res.redirect("back");
        })
});


app.post('/removeFavourite/:id', auth.isUserLoggedIn, async (req,res)=>{
    User.findById(req.user._id)
        .then(async user=> {
            user.favourites = await user.favourites.filter((favourite,index)=>{
                return favourite.imdbID !== req.params.id;
            });
            user.save()
                .then(data => {
                    console.log("successfully removed from favourites!");
                    req.flash("success_msgs","successfully removed from favourites!");
                    res.redirect("back");
                })
        })
        .catch(err=>{
            console.log(err);
            res.redirect("back");
        })
});


app.get('/favourites', auth.isUserLoggedIn, async (req,res)=>{
    User.findById(req.user._id)
        .then(async user=>{
            var favouriteList = [];
            for(var i=0; i < user.favourites.length;i++){
                const response  = await fetch(`http://www.omdbapi.com/?i=${user.favourites[i].imdbID}&apikey=${process.env.API_KEY}`);
                const movie = await response.json();
                console.log("movieee---- ",movie);
                favouriteList.push(movie);
            }
            res.render("favourite",{favouriteList:favouriteList});
        })
        .catch(err=>{
            console.log(err);
            res.redirect("back");
        })
})



app.post('/addComment/:id', auth.isUserLoggedIn, (req,res)=>{
    const comment = req.body.comment;
    if(comment === ''){
        res.redirect("back");
    }
    User.findById(req.user._id)
        .then(user=>{
            user.favourites.forEach(favourite=>{
                if(favourite.imdbID === req.params.id){
                    favourite.comments.push(comment);
                    user.save()
                        .then(data => {
                            console.log("successfully added to comments!");
                            req.flash("success_msgs","successfully added to comments!");
                            res.redirect("back");
                        })
                }
            })
        })
        .catch(err=>{
            console.log(err);
            res.redirect("back");
        })
});


app.post('/removeComment/:id/:cid', auth.isUserLoggedIn, (req,res)=>{
    User.findById(req.user._id)
        .then(user=>{
            user.favourites.forEach(favourite=>{
                if(favourite.imdbID === req.params.id){
                    favourite.comments.splice(req.params.cid,1);
                    user.save()
                        .then(data => {
                            console.log("successfully removed from comments!");
                            req.flash("success_msgs","successfully removed from comments!");
                            res.redirect("back");
                        })
                }
            })
        })
        .catch(err=>{
            console.log(err);
            res.redirect("back");
        })
});

app.post('/addReview/:id', auth.isUserLoggedIn, (req,res)=>{
    const review = req.body.review;
    if(review && review>10){
         res.redirect("back");
     }
    User.findById(req.user._id)
        .then(user=>{
            user.favourites.forEach(favourite=>{
                if(favourite.imdbID === req.params.id){
                    favourite.reviews=review;
                    user.save()
                        .then(data => {
                            console.log("successfully added to reviews!");
                            req.flash("success_msgs","successfully added to review!");
                            res.redirect("back");
                        })
                }
            })
        })
        .catch(err=>{
            console.log(err);
            res.redirect("back");
        })
});


app.get("/login", (req, res) => {
    if (req.isAuthenticated() && req.user.type === "USER")
        res.redirect("/userhome");
    else
        res.render("login",{user:req.user});
});

app.post('/login', (req, res, next) => {
    passport.authenticate('user-local', {
        successRedirect: '/userhome',
        failureRedirect: '/login',
        failureFlash: 'Invalid username or password'
    })(req, res, next);
});


app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    // console.log(req.body);
    const { name, email, password1, password2 } = req.body;
    let errors = [];
    if (!name || !email || !password1 || !password2) {
        errors.push('Please fill in all required fields');
    }
    if (password1 !== password2) {
        errors.push('Passwords do not match');
    }
    if (password1.length < 8) {
        errors.push('Password should be at least 8 characters long');
    }
    if (errors.length > 0) {
        console.log(errors)
        res.render("register", { errors, name, email, password1, password2 });
    } else {
        User.findOne({ email })
            .then(user => {
                if (user) {
                    errors.push('This email has already been registered');
                    res.render("register", { errors, name, email, password1, password2 });
                } else {
                    const newUser = new User({ name, email, password: password1 });
                    bcrypt.genSalt(parseInt(process.env.SECRET_NUMBER), (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) { console.log(err);throw err; }
                            newUser.password = hash;
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msgs', 'Successfully registered!');
                                    res.redirect('login');
                                })
                                .catch(err => console.log(err));
                        });
                    });
                }
            });
    }
});

app.get("/logout", auth.isUserLoggedIn, (req, res) => {
    req.logout();
    req.flash('success_msgs', 'Successfully logged out');
    res.redirect('/login')
});

app.listen(port, () => {
    console.log(`server running on port ${port}`);
})