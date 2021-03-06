modules.define('router', ['template', 'config', 'flights'],
    function(provide, template, config, flights) {

var express = require('express'),
    router = express.Router();

router.get('/', function(req, res, next) {
    flights.getAll().then(function(data){
        template('desktop',
        { view : 'index', settings : config.settings,
          flights : data, title : 'Dubov Vladislav | Task1', description : 'Тестовое задание для ШРИ 2015'
        })
            .then(function(html) {
                res.send(html);
            })
            .fail(function(err) {
                res.send(403, err);
            });
    });
});

router.get('/error', function(req, res, next) {
    template('desktop', { view : 'error', settings : config.settings })
            .then(function(html) {
                res.send(html);
            })
            .fail(function(err) {
                res.send(403, err);
            });
});

router.get('/context', function(req, res, next) {
    template('desktop', { test : 'test' }, {
        block : 'test',
        content : 'block'
    }).then(function(html) {
        res.send(html);
    }).fail(function(err) {
        res.send(403, err);
    });
});

provide(router);

});
