var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    db = require("./models/index"),
    passport = require("passport"),
    request = require("request"),
    passportLocal = require("passport-local"),
    cookieParser = require("cookie-parser"),
    session = require("cookie-session"),
    flash = require("connect-flash"),
    async = require("async"),
    yelp = require("yelp").createClient({
      consumer_key: process.env.YELP_CONSUMER_KEY,
      consumer_secret: process.env.YELP_CONSUMER_SECRET,
      token: process.env.YELP_TOKEN,
      token_secret: process.env.YELP_TOKEN_SECRET});
    var morgan = require('morgan');
    var routeMiddleware = require("./config/routes");
    var geocoderProvider = 'google';
    var httpAdapter = 'http';
    var geocoder = require('node-geocoder').getGeocoder(geocoderProvider, httpAdapter);
   


// Middleware for ejs, grabbing HTML and including static files
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));


// we are going to create a cookie that will store our session data
// ideally we want this secret to be a string of random numbers
// we use the secret to parse the data from the cookie
// This is cookie-based session middleware so technically this creates a session
// This session can expire and doesn't live on our server

// The session middleware implements generic session functionality with in-memory storage by default. It allows you to specify other storage formats, though.
// The cookieSession middleware, on the other hand, implements cookie-backed storage (that is, the entire session is serialized to the
  //cookie, rather than just a session key. It should really only be used when session data is going to stay relatively small.
// And, as I understand, it (cookie-session) should only be used when session data isn't sensitive.
// It is assumed that a user could inspect the contents of the session, but the middleware will detect when the data has been modified.
app.use(session( {
  secret: 'thisismysecretkey',
  name: 'chocolate chip',
  // this is in milliseconds
  maxage: 3600000
  })
);

// get passport started
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// prepare our serialize functions
passport.serializeUser(function(user, done){
  console.log("SERIALIZED JUST RAN!");
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  console.log("DESERIALIZED JUST RAN!");
  db.User.find({
      where: {
        id: id
      }
    })
    .done(function(error,user){
      done(error, user);
    });
});

/////////////////////////GOING TO HOME PAGE /////////////////////////////



//Landing Page
app.get('/',routeMiddleware.preventLoginSignup, function(req, res){
  res.render("index");
});

//Sign up Page
app.get('/signup',routeMiddleware.preventLoginSignup, function(req,res) { 
  res.render("signup", { username: ""});
});

//Log in Page
app.get('/login',routeMiddleware.preventLoginSignup, function(req,res) { 
  res.render("login", { message:req.flash('loginMessage'), username:""});
});


//After loging in Home Page
app.get('/home',routeMiddleware.checkAuthentication, function(req,res){
  res.render("home", {user: req.user});
});


// When the user submits the signup form
app.post('/signup', function(req,res) { 
  db.User.createNewUser(req.body.username, req.body.password,
    //err
    function(error){
      res.render("signup",{message:error.message, username: req.body.username});
    },
    //success
    function (success){
      res.render("index",{message:success.message});
    }
    );
});


//When the user submits his login form
app.post('/login', passport.authenticate('local',{
  successRedirect: '/home',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});






/////////////////Actual INFORMATION////////////////////////////
//Show
app.get('/favorite',routeMiddleware.checkAuthentication, function(req,res) { 
  db.User.find({where:{id: req.user.id}}).done(function(error,peep){
    peep.getFoods().done(function(error,foods){
      res.render('favorite',{allFoods: foods});
    });
  });
});

app.post('/favorite', function(req,res){
  db.User.find({where:{id: req.user.id}}).done(function(error, peep){
    var str = JSON.stringify(req.body.info);
    db.Food.create({recipe: str}).done(function(error,food){
      if (error) {
        console.log("error creating food", error);
      }
      food.addUsers(peep);
      res.redirect('/favorite');
    });
  });
});

app.delete('/favorite/:id', function(req,res){
  db.Food.find(req.params.id).done(function(err,food){
   db.User.find(req.user.id).done(function(err,user){
    user.removeFood(food);
    res.redirect('/favorite');
    });
  });  
});


// Searching for recipes
app.get('/search',routeMiddleware.checkAuthentication, function(req,res) { 
  var number = Math.floor((Math.random() * 350) + 1);
  var searchTerm = req.query.foodTitle;
  var url ="https://api.yummly.com/v1/api/recipes?_app_id=d38fff6d&_app_key="+process.env.YUMMLY_API_KEY+"&q=" + searchTerm + "&maxResult=20&start="+number;

  request(url, function(error,response, body){
    if(!error && response.statusCode === 200){
      var obj = JSON.parse(body);
      res.render("results", {foodList: obj.matches});
    }
  });
});


//Lists out the details of the receipe I chose) Ingredient
app.get('/details/:id',routeMiddleware.checkAuthentication, function(req,res) { 
  var detailTerm = req.params.id;
  var url ="https://api.yummly.com/v1/api/recipe/"+detailTerm+"?_app_id=d38fff6d&_app_key="+process.env.YUMMLY_API_KEY+"";
  request(url, function (error, response, body){
    if(!error && response.statusCode === 200) {
      var obj1 = JSON.parse(body);
      res.render("detail",{detailList: obj1});
    }
  });
});


app.get('/yelp',routeMiddleware.checkAuthentication, function(req,res) { 
  var searchTerm = req.query.yelpTitle;
  yelp.search({term: searchTerm, location: "San Francisco"}, function(error, data) {
    var coords = [];
    async.forEach(data.businesses, function(location,callback){
      geocoder.geocode({address: location.location.address, country: location.location.country_code, zipcode: location.location.postal_code}, function(err, resser){
      // console.log("RZA?", resser);
      if(resser !== undefined){
        resser.forEach(function(data){
          console.log("THIS IS DA LONG", data.longitude);
          console.log("THIS IS DA LAT", data.latitude);
          coords.push({yelpLat: data.latitude, yelpLong: data.longitude, yelpName: location.name, yelpAddress: location.location.address, yelpPic: location.image_url, yelpRat: location.rating_img_url, yelpUrl: location.url});
        });
        callback();
        }
       else{
           callback(); 
          }  
      });
    },
    function(){
      res.render("map",{coords:JSON.stringify(coords)});
    });
  });
});

app.get('/about', function(req,res) { //My about page
  res.render('about');
});

app.get('/contact', function(req, res) { // My contact page
  res.render('contact');
});

var server = app.listen(process.env.PORT || 3000, function() {
    console.log('Listening on port %d', server.address().port);
});