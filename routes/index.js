var express = require('express');
var router = express.Router();
const userModel = require('./users')
const upload = require('./multer')
const postModel = require('./post')

var users = require('./users')
var passport = require('passport')
var localStrategy = require('passport-local')
passport.use(new localStrategy(users.authenticate()))

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {nav: false});
});

router.get('/register', function(req, res, next) {
  res.render('register' , {nav: false})
})


router.get('/profile',isloggedIn , async function(req, res, next) {
  const user = 
  await userModel
  .findOne({username: req.session.passport.user})
  .populate('posts')
  res.render('profile', {user, nav: true})
})

router.get('/show/posts',isloggedIn , async function(req, res, next) {
  const user = 
  await userModel
  .findOne({username: req.session.passport.user})
  .populate('posts')
  res.render('show', {user, nav: true})
})

router.get('/feed',isloggedIn , async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  const posts = await postModel.find()
  .populate('user')

  res.render('feed', {user, posts, nav: true})
})


router.get('/add',isloggedIn , async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  res.render('add', {user, nav: true})
})

router.post('/createpost',isloggedIn,upload.single("postimage") ,async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
 const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename
  })

  user.posts.push(post._id)
  await user.save()
  res.redirect('/profile')
})

router.post('/fileupload',isloggedIn, upload.single('image'), async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user})
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect('/profile')
})


router.post('/register', (req, res, next) => {
const newUser = {
//user data here

username: req.body.username,
name: req.body.fullname,
email: req.body.email,
contact: req.body.contact

//user data here
};
users
.register(newUser, req.body.password)
.then((result) => {
passport.authenticate('local')(req, res, () => {
//destination after user register
res.redirect('/profile');
});
})
.catch((err) => {
res.send(err);
});
});

router.post(
'/login',
passport.authenticate('local', {
successRedirect: '/profile',
failureRedirect: '/',
}),
(req, res, next) => { }
);
function isloggedIn(req, res, next) {
if (req.isAuthenticated()) return next();
else res.redirect('/');
}

router.get('/logout', (req, res, next) => {
if (req.isAuthenticated())
req.logout((err) => {
if (err) res.send(err);
else res.redirect('/');
});
else {
res.redirect('/');
}
});

module.exports = router;
