/*
Module Dependencies 
*/
var express = require('express'),
    http = require('http'),
    path = require('path'),
    mongoose = require('mongoose'),
    hash = require('./pass').hash,
    ObjectID = require('mongodb').ObjectID;

var app = express();

/*
Database and Models
*/
// mongoose.connect("mongodb://localhost/myapp");
mongoose.connect("mongodb://root:root@proximus.modulusmongo.net:27017/aB5ubeqo/myapp");
var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    alias: String,
    isOnl: Number,
    ava: String,
    friend : { type : Array , "default" : [] },
    salt: String,
    hash: String
});
var MsgSchema = new mongoose.Schema({
    msg : { type : Array , "default" : [] },
});

//Create static method for findAndModify
UserSchema.statics.findAndModify = function (query, sort, doc, option, callback){
    return this.collection.findAndModify(query, sort, doc, option, callback);
};

var User = mongoose.model('users', UserSchema);
var Msg = mongoose.model('messages', MsgSchema);
/*
Middlewares and configurations 
*/
app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.cookieParser('Authentication Tutorial '));
    app.use(express.session());
    app.use(express.static(path.join(__dirname, 'public')));
    // app.set('views', __dirname + '/views');
    // app.set('view engine', 'jade');
    // view engine setup
    app.set('view engine', 'html');
    app.engine('html', require('ejs').renderFile);
    app.set('views', __dirname + '/views');
});

app.use(function (req, res, next) {
    var err = req.session.error,
        msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    next();
});
/*
Helper Functions
*/
function authenticate(name, pass, fn) {
    if (!module.parent) console.log('authenticating %s:%s', name, pass);

    User.findOne({
        username: name
    },

    function (err, user) {
        if (user) {
            if (err) return fn(new Error('cannot find user'));
            hash(pass, user.salt, function (err, hash) {
                if (err) return fn(err);
                if (hash == user.hash) return fn(null, user);
                fn(new Error('invalid password'));
            });
        //if (user.pass != pass) return fn(new Error('invalid password'));
        } else {
            return fn(new Error('cannot find user'));
        }
    });

}

function requiredAuthentication(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/login');
    }
}

function userExist(req, res, next) {
    User.count({
        username: req.body.username
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            req.session.error = "User Exist"
            res.redirect("/signup");
        }
    });
}

/*
Routes
*/
app.get("/", function (req, res) {

    if (req.session.user) {
        //res.send("Welcome " + req.session.user.username + "<br>" + "<a href='/logout'>logout</a>");
        console.log(req.session.user.alias); 
        res.json(req.session.user); 
    } else {
        //res.send("<a href='/login'> Login</a>" + "<br>" + "<a href='/signup'> Sign Up</a>");
        res.render('login');    
    }
});
app.get('/home', requiredAuthentication, function(req, res){
    res.render('index');
});
app.get("/signup", function (req, res) {
    if (req.session.user) {
        res.redirect("/");
    } else {
        res.render('signup');
    }
});

app.post("/signup", userExist, function (req, res) {
    var password = req.body.password;
    var username = req.body.username;
    var alias = req.body.alias;
    var ava = req.body.ava;

    hash(password, function (err, salt, hash) {
        if (err) throw err;
        var user = new User({
            username: username,
            salt: salt,
            hash: hash,
            alias: alias,
            ava: ava,
            friend: []
        }).save(function (err, newUser) {
            if (err) throw err;
            authenticate(newUser.username, password, function(err, user){
                if(user){
                    req.session.regenerate(function(){
                        req.session.user = user;
                        req.session.success = 'Authenticated as ' + user.username + ' click to <a href="/logout">logout</a>. ' + ' You may now access <a href="/restricted">/restricted</a>.';
                        res.redirect('/home');
                    });
                }
            });
        });
    });
    //console.log(password + username + alias + ava);
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.post("/login", function (req, res) {
    authenticate(req.body.username, req.body.password, function (err, user) {
        if (user) {

            req.session.regenerate(function () {

                req.session.user = user;
                req.session.success = 'Authenticated as ' + user.username + ' click to <a href="/logout">logout</a>. ' + ' You may now access <a href="/restricted">/restricted</a>.';
                res.redirect('/home');
            });
        } else {
            req.session.error = 'Authentication failed, please check your ' + ' username and password.';
            res.redirect('/login');
        }
    });
});

app.get('/logout', function (req, res) {
    req.session.destroy(function () {
        res.redirect('/');
    });
});

app.get('/profile', requiredAuthentication, function (req, res) {
    res.send('Profile page of '+ req.session.user.username +'<br>'+' click to <a href="/logout">logout</a>');
});

//Set online
app.post('/online', function (req, res){
    User.findAndModify(
        {'username': req.body.uname},
        [],
        {$set: {'isOnl': 1}},
        {}, function (err, object){
            if (err) throw err;
            res.send(
                (err === null) ? { msg: '' } : { msg: err }
            );
            console.log('Update Online for user: ' + req.body.uname);
        }); 
});
//Set offline
app.post('/offline', function (req, res){
    User.findAndModify(
        {'username': req.body.uname},
        [],
        {$set: {'isOnl': 0}},
        {}, function (err, object){
            if (err) throw err;
            res.send(
                (err === null) ? { msg: '' } : { msg: err }
            );
            console.log('Update Offline for user: ' + req.body.uname);
        }); 
});
//Update AVA
app.post('/updateAva', function (req, res ){
    User.findAndModify(
        {'username': req.body.uname},
        [],
        {$set: 
            {
                "ava": req.body.ava
            }
        },
        {}, function (err, object){
            if (err) throw err;
            res.send(
                (err === null) ? { msg: '' } : { msg: err }
            );
            console.log('Update Ava for user: ' + req.body.uname);
        });
});
//Update
app.post('/update', function (req, res){
    if (req.body.alias === ''){
        console.log('alias null');
        hash(req.body.pass, function (err, salt, hash) {
            if (err) throw err;
            User.findAndModify(
                {'username': req.body.uname},
                [],
                {$set: 
                    {
                        "hash": hash,
                        "salt": salt
                    }
                },
                {}, function (err, object){
                    if (err) throw err;
                    res.send(
                        (err === null) ? { msg: '' } : { msg: err }
                    );
                    console.log('Update Pass for user: ' + req.body.uname);
                });
        });
    }
    else if(req.body.pass === '') {
        console.log('pass null');
        User.findAndModify(
            {'username': req.body.uname},
            [],
            {$set: {'alias': req.body.alias}},
            {}, function (err, object){
                if (err) throw err;
                res.send(
                    (err === null) ? { msg: '' } : { msg: err }
                );
                console.log('Update  Alias for user: ' + req.body.uname);
            });
    }
    else{
        console.log('Update Full');
        hash(req.body.pass, function (err, salt, hash) {
            if (err) throw err;
            User.findAndModify(
                {'username': req.body.uname},
                [],
                {$set: 
                    {
                        'alias': req.body.alias,
                        "hash": hash,
                        "salt": salt
                    }
                },
                {}, function (err, object){
                    if (err) throw err;
                    res.send(
                        (err === null) ? { msg: '' } : { msg: err }
                    );
                    console.log('Update Alias and Pass for user: ' + req.body.uname);
                });
        });
    }
     
});
//Get list friend
app.get('/getFriend/:uname', function (req, res) {
    User.findOne({ username: req.param('uname') },
        {friend: 1},
        function (err, user) {
            res.json(user);
            console.log("get Friend of user: "+ req.param('uname'));
    });
});
//Get User with uname
app.get('/getUser/:uname', function (req, res) {
    User.findOne({ username: req.param('uname') },
        function (err, user) {
            res.json(user);
            console.log("get infor of Friend: "+ req.param('uname'));
    });
});
//Get all message from mID
app.get('/getMessageFrom/:id', function (req, res) {
    Msg.findOne({_id: req.params.id},
        function (err, fmsg) {
            res.json(fmsg.msg);
            console.log("get Msg: "+ req.params.id);
    });
});
//Save new msg
app.post('/addMsg/:mId', function (req, res){

    Msg.update(
       { _id: req.body.mid },
       { $push: { msg: { 
                            "ufrom": req.body.ufrom,
                            "uto": req.body.uto,
                            "time": req.body.time, 
                            "content": req.body.content, 
                            "unread": req.body.unread 
                        }
                }
        }
    , function (err, fmsg) {
        console.log("add Msg: "+ req.body.mid);
    });
});
//Get new Msg
app.get('/getNewMsg/:uto', function (req, res) {
    Msg.find(
            //{_id: req.params.id},
            {msg: {$elemMatch: {uto: req.param('uto'), unread: 0}}},
        function (err, nMsg){
            res.send(nMsg);
            console.log("listen...");
        });
});
//Set read msg
app.post('/setReadMsg', function (req, res){
    Msg.update(
       { _id: req.param('mid'), 
           "msg.time": req.param('time') },
       { $set: { "msg.$.unread" : 1 } }, 
        function(err, nMsg){
            //res.send(nMsg);
            console.log("setRead: "+ req.param('time'));
        });
});
//Search
app.get('/search/:alias', function (req, res) {
    User.find(
            {alias: {$regex: req.param('alias')}},
        function(err, uList){
            res.send(uList);
            console.log("Search...");
        });
});
//Save new friend
app.post('/addFriend', function (req, res){
    //insert new msg
    var msg = new Msg();
    msg.save(function(err, newMsg){
        if(err){
            throw err;
            console.log(err);
        }else{
            console.log('saved msg !');
            //add friend
            User.update(
               { _id: req.body.uid },
               { $push: { friend: { 
                                    "fID": req.body.fID,
                                    "msgID": newMsg._id
                                }
                        }
                }
            , function (err, fmsg) {
                console.log("add new friend");
            });
        }
    });
});
//Apply new friend
app.post('/applyFriend', function (req, res){
    User.update(
       { _id: req.body.uid },
       { $push: { friend: { 
                            "fID": req.body.fID,
                            "msgID": req.body.msgID
                        }
                }
        }
    , function (err, fmsg) {
        console.log("apply new friend");
    });
});
//Listen port
http.createServer(app).listen(3000);