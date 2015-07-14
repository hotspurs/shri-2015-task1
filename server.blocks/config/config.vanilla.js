modules.define('config', function(provide) {

provide({
    express : {
        port : '3000',
        simlinks : [
            {
                src : '../../desktop.bundles/index/_index.css',
                dest : '../../public/_index.css'
            },
            {
                src : '../../desktop.bundles/index/_index.js',
                dest : '../../public/_index.js'
            }
        ]
    },
    bem : {
        bundles : ['desktop']
    },
    settings : {
        baseUrl : 'http://examples.com'
    }
});

});
