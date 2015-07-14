modules.define('app',
['config', 'morgan', 'router'],
function(provide, config, morgan, router) {

var path = require('path'),
    fs = require('fs'),
    express = require('express'),
    app = express(),
    multer  = require('multer'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    session = require('express-session');

/*
 * SET
 */
app.set('handle', process.env.PORT || config.express.port);

/**
 * USE
 */
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended : true })); // for parsing application/x-www-form-urlencoded
app.use(multer({
    dest : path.resolve(__dirname, '../../public/uploads/'),
    includeEmptyFields : true
}));
app.use(methodOverride(function(req, res) {
    if(req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
}));
app.use(cookieParser());
app.use(session({
    secret : 'ololo',
    resave : false,
    saveUninitialized : true
}));

var logsAccessPath = path.resolve(__dirname, '../../logs/access.log');

// TODO: existsSync will be deprecated
if(!fs.existsSync(logsAccessPath)) {
    fs.closeSync(fs.openSync(logsAccessPath, 'w'));
}

var simlinks = config.express.simlinks;
if(simlinks && simlinks.length) {
    simlinks.forEach(function(linkConf) {
        var srcPath = path.resolve(__dirname, linkConf.src),
            destPath = path.resolve(__dirname, linkConf.dest);

        // TODO: existsSync will be deprecated
        if(!fs.existsSync(destPath)) {
            fs.linkSync(srcPath, destPath);
        }
    });
}

var accessLogStream = fs.createWriteStream(logsAccessPath, { flag : 'a' });

app.use(morgan('short', { stream : accessLogStream }));

app.use('/', express.static(path.resolve(__dirname, '../../public')));
app.use(router);

provide(app);

});
