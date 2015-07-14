modules.define('template', ['config'], function(provide, config) {

    var fs = require('fs'),
        path = require('path'),
        vm = require('vm'),
        vow = require('../../libs/bem-core/common.blocks/vow/vow.vanilla.js');

    // Готовим бандлы
    var bundles = config.bem.bundles,
        bundlesTemplates = {};

    bundles.forEach(function(bundle) {
        var pathToBundle = path.resolve(bundle + '.bundles', 'index'),
            bemtreeTemplate = fs.readFileSync(path.join(pathToBundle, '_index.bemtree.js'), 'utf-8'),
            context = vm.createContext({
                console : console,
                Vow : vow,
                borschik : {
                    link : function(i) {
                        return i;
                    }
                }
            });

        vm.runInContext(bemtreeTemplate, context);

        bundlesTemplates[bundle] = {
            BEMHTML : require(path.join(pathToBundle, '_index.bemhtml.js')).BEMHTML,
            BEMTREE : context.BEMTREE
        };
    });

    function template(bundle, data, context) {
        return bundlesTemplates[bundle].BEMTREE.apply({ block : 'root', data : data, context : context })
            .then(function(bemjson) {

                var html;

                try {
                    html = bundlesTemplates[bundle].BEMHTML.apply(bemjson);
                } catch(e) {
                    throw new Error(e);
                }

                return html;

            });
    }

provide(template);

});
