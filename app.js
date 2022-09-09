if (!process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const dbUrl = process.env.DB_URL
const Question = require('./models/q')
const bodyParser = require('body-parser')
const methodOverride = require('method-override');
const Comment = require('./models/comment')

const userRoutes = require('./routes/user');
const { post } = require('./routes/user');

const questionRoutes = require('./routes/question')
const commentRoutes = require('./routes/comment')

// mongodb://localhost:27017/quirl

mongoose.connect('mongodb://localhost:27017/quirl', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const sessionConfig = {
    secret: 'thisisthesecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(express.json())

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
// passport.use(new LocalStrategy(
//     function (username, password, done) {
//         User.findOne({ username: username }, function (err, user) {
//             if (err) { return done(err); }
//             if (!user) { return done(null, false); }
//             if (!user.verifyPassword(password)) { return done(null, false); }
//             return done(null, user);
//         });
//     }
// ));
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', userRoutes)
app.use('/q', questionRoutes)
app.use('/q/:id/comments', commentRoutes)

app.get('/', async (req, res) => {
    const questions = await Question.find({}).populate('author');
    res.render('home', { questions })
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err });
})


app.listen(3000, () => {
    console.log('Quirl')
})

