modules.define('air-checkbox', ['i-bem__dom', 'jquery'], function(provide, BEMDOM, $){

    provide( BEMDOM.decl(this.name, {
        onSetMod : {
            js : {
                inited : function(){
                }
            }
        },
        _onChange : function(){
            this.emit('change');
        }
    },{
        live : function(){
            this.liveBindTo('change', function(){
                this._onChange();
            });
        }
    }
    ));

});
