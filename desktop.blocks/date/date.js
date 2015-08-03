modules.define('date', ['i-bem__dom', 'jquery'], function(provide, BEMDOM, $){

    provide( BEMDOM.decl(this.name, {
        onSetMod : {
            js : {
                inited : function(){
                    this.months = ['Января','Февраля','Марта','Апреля','Мая',
                          'Июня','Июля','Августа','Сентября',
                          'Октября','Ноября','Декабря'];
                    var dateRow = this.elem('row','type','date'),
                        timeRow = this.elem('row','type','time'),
                        self = this;

                    dateRow.text( this._getStrDate() );
                    timeRow.text( this._getStrTime() );


                    setInterval(function(){
                        dateRow.text( self._getStrDate() );
                        timeRow.text( self._getStrTime() );
                    },1000);
                }
            }
        },
        _getStrDate : function(){
            var date = new Date(),
                day = date.getDate(),
                month = date.getMonth(),
                year = date.getFullYear();

                if(day < 10) day = '0'+day;

                return day+' '+this.months[month]+' '+year;

        },
        _getStrTime : function(){
            var date = new Date(),
            hours = date.getHours(),
            minutes = date.getMinutes(),
            seconds = date.getSeconds();

            if(hours < 10) hours = '0'+hours;
            if(minutes < 10) minutes = '0'+minutes;
            if(seconds < 10) seconds = '0'+seconds;

            return hours+":"+minutes+":"+seconds;
        }
    },{
    }
    ));

});
