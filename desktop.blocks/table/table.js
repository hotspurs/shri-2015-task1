modules.define('table', ['i-bem__dom', 'jquery','next-tick'], function(provide, BEMDOM, $, nextTick){

    provide( BEMDOM.decl(this.name, {
        onSetMod : {
            js : {
                inited : function(){
                    this._cloneAndPrepareHeader();
                    var onScroll = this._onScroll.bind(this),
                        onResize = this._onResize.bind(this);
                    onResize();
                    onScroll();
                    $(window).scroll( onScroll );
                    $(window).resize( onResize );
                    BEMDOM.blocks['air-checkbox'].on('change', function(){
                        nextTick(onResize);
                    });
                }
            }
        },
        _cloneAndPrepareHeader : function(){
            var table = this.domElem,
                tableClone =  table.clone(true).empty().addClass('table_sticky'),
                headerClone = table.find('.table__head').clone(true),
                stickyHeader = $('<div></div').addClass('sticky-header sticky-header_hide')
                                              .attr('area-hidden', true);
                stickyHeader.append(tableClone).find('.table').append(headerClone);
                table.after(stickyHeader);
                this.tableHeight = table.height();
                this.headerCells = table.find('.table__head .table__cell');
                this.headerCellHeight = $(this.headerCells[0]).height(),
                this.stickyHeader = stickyHeader;
                this.top = table.offset().top;
                this.bottom = this.tableHeight + this.top - this.headerCellHeight;
                this.stickyHeaderCells = stickyHeader.find('.table__cell');
        },
        _onResize : function(){

              console.log('RESIZE');
              console.log('THIS', this);

              var tableWidth = this.domElem.width();
              this.stickyHeader.css('width', tableWidth);
              for(var i = 0, l = this.headerCells.length; i < l; i++){
                 $(this.stickyHeaderCells[i]).css('width', $(this.headerCells[i]).width());
              }
        },
        _onScroll : function(){
            var curPos = $(window).scrollTop();
            if(curPos > this.top && curPos < this.bottom){
              this.stickyHeader.removeClass('sticky-header_hide');
            }
            else{
              this.stickyHeader.addClass('sticky-header_hide');
            }
        }
    }
    ));

});
