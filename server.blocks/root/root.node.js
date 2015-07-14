modules.require(['app'], function (app) {
    app.listen(app.get('handle'), function() {
        console.log('Express server listening on port ' + app.get('handle'));
    });
});
