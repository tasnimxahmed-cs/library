//digital library
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const session = require('express-session');
const hbs = require('express-handlebars');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const cookieParser = require('cookie-parser');

const mongoose = require('mongoose');
const User = require('./models/user');


const app = express();

mongoose.connect(process.env.MONGODB_USERS_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then((result) => {
  console.log('mongoose connected to mongodb')
})
.catch((error) => {
  console.log(error)
})

//middleware
app.engine('hbs', hbs.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, './public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//passport
app.use(passport.initialize())
app.use(passport.session());

//cookies
app.use(cookieParser());

app.use('/add', (req, res, next) => {
  req.headers.authorization = `Bearer ` +  req.cookies.token;
  next();
})

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  })
});

passport.use(new LocalStrategy (
  {
    usernameField: 'username',
    passwordField: 'pass'
  },
  (function verify(username, password, done) {
  User.findOne({ username: username}, function (err, user) {
    if(err) return done(err)
    if(!user)
    {
      return done(null, false, { message: 'Incorrect Username!' });
    }

    bcrypt.compare(password, user.password, function (err, res) {
      if(err) return done(err)
      if(res == false) return done(null, false, { message: 'Incorrect Password!' });

      return done(null, user);
    })
  });
})));

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SESSION_SECRET
};
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
  User.findOne({id: jwt_payload.id}, function(err, user) {
      if (err) {
          return done(err, false);
      }
      if (user) {
          return done(null, user);
      } else {
          return done(null, false);
      }
  });
}));

function isLoggedIn (req, res, next)
{
  if(req.isAuthenticated()) return next();
  res.redirect('/login');
}

function isLoggedOut (req, res, next)
{
  if(!req.isAuthenticated()) return next();
  res.redirect('/');
}

app.get('/', isLoggedIn, async (req, res) => {
  const payload = {
    username: req.user.username,
    id: req.user._id
  };

  const token = jwt.sign(payload, process.env.SESSION_SECRET, { expiresIn: "1d" });
  res.cookie(`token`, `${token}`, {
        maxAge: 86400,
        secure: true,
        httpOnly: true,
        sameSite: 'lax'
  });

  var profile = await User.findById(req.user._id).exec();
  const books = profile.books;
  books.forEach(element => {
    delete element._doc._id;
  });

  res.render('index', { title: 'Library | Home', books: books, layout: false })
});

app.get('/login', isLoggedOut, (req, res) => {
  if(req.session.hasOwnProperty('messages'))
  {
    res.render('login', { title: 'Library | Login', notif: req.session.messages[0], layout: false })
  }
  else
  {
    res.render('login', { title: 'Library | Login', layout: false })
  }
  
});

app.get('/logout', function (req, res) {
  req.logout(function(err){
    if(err) return next(err);
    res.redirect('/');
  });
});

app.post('/login', passport.authenticate('local',
  {
    successRedirect: '/',
    failureRedirect: '/login?error=true',
    failureMessage: true
  }
  ));

app.get('/signup', (req, res) => {
  res.render('signup', { title: 'Library | Sign Up', layout: false })
});

app.post('/signup', async (req, res) => {
  const exists = await User.exists({ username: req.body.username });

  if(exists)
  {
    res.redirect('/login');
    return;
  }

  bcrypt.genSalt(10, function (err, salt) {
     if (err) return next(err);
     bcrypt.hash(req.body.pass, salt ,function (err, hash) {
      if(err) return next(err);
      const newUser = new User({
        username: req.body.username,
        password: hash
      });

      newUser.save()

      res.redirect('/login');
     })
  })
});

app.get('/add', passport.authenticate('jwt', { session: false }), async (req, res) => {
  res.render('add', { title: 'Library | Add Items', id: req.user._id, layout: false })
})

app.post('/updateDb', async (req, res) => {
  var title;
  var author;
  var pbd;
  var pg;
  var pb;
  var isbnth;
  var isbnt;

  isbnNum = req.body.isbn;
  if((isbnNum.length <1 || isbnNum.length >13) || (isNaN(parseInt(isbnNum))))
  {
    res.sendStatus(204);
    return;
  }

  endpoint="https://openlibrary.org/isbn/"+isbnNum+".json"
  const data = await fetch(endpoint);
  if(data.status == 404)
  {
    res.sendStatus(204);
    return;
  }
  const json = await data.json()

  if(json.title != undefined) title = json.title;
  else title = "Title Not Found";

  if(json.authors != undefined)
  {
      const data1 = await fetch(`http://openlibrary.org${json.authors[0].key}.json`)
      const json1 = await data1.json();
      author = json1.name;
  }
  else author = "Author Not Found";

  if(json.publish_date != undefined) pbd = json.publish_date;
  else pbd = "Publish Date Not Found";

  if(json.number_of_pages != undefined) pg = json.number_of_pages;
  else pg = "Number of Pages Not Found";

  if(json.publishers != undefined) pb = json.publishers[0];
  else pb = "Publishers Not Found";

  if(json.isbn_13 != undefined) isbnth = parseInt(json.isbn_13[0]);
  else isbnth = "ISBN13 Not Found";

  if(json.isbn_10 != undefined) isbnt = parseInt(json.isbn_10[0]);
  else isbnt = "ISBN10 Not Found";  

  if(json.description != undefined)
  {
      if(typeof(json.description) == "object") description = json.description.value;
      else description = json.description;
  }
  else description = 'Description Not Found';

  userDoc = await User.findOneAndUpdate({ 
    _id: req.user._id,
    'books.isbn_13': { $ne: isbnth}
    }, { $push: { books: {
    title: title,
    author: author,
    publish_date: pbd,
    number_of_pages: pg,
    publisher: pb,
    isbn_13: isbnth,
    isbn_10: isbnt,
    description: description
}}});

  res.sendStatus(204);
});

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}`);
});