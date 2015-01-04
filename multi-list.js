// localStorage wrapper
var ls = (function() {

    var set = function(key, value) {
        localStorage.setItem(key, JSON.stringify({
            value: value
        }));
    };

    var get = function(key) {
        var str = localStorage.getItem(key);
        if (str) {
            return JSON.parse(str).value;
        } else {
            return null;
        }
    };

    var remove = function(key) {
        localStorage.removeItem(key);
    };    

    return {
        set: set,
        get: get, 
        remove: remove,
        clear: localStorage.clear
    }

}());

(function($) {
    $.fn.addListItems = function() {
        var that = this;

        addItemHandler();

        function addItemHandler() {
            var addBut = $(that).find('.addItem');
            var list = that.find('ul');

            addBut.click(function() {
                list.append('<li></li>').attr('contenteditable', 'true');
            });
        }

        return that;
    };
}(jQuery));


var listObj = listObj || {};

(function($) {

    listObj.store = {
        saveLists: function() {
            this.validateLists();

            this._saveLists();
        },

        validateLists: function() {
            var msg = '';

            if ( $('.leftList li').length == 0 ) {
                msg += '<span>Please add items to the LEFT list</span>';
            }

            if ( $('.rightList li').length == 0 ) {
                msg += '<span>Please add items to the RIGHT list</span>';
            }
            
            if ( $('.leftList li').length != 0 && $('#leftAllowed').val() > $('.leftList li').length ) {
                msg += '<span>"LEFT Items" should not be greater than the items from LEFT List</span>';
            }

            if ( $('.rightList li').length != 0 && $('#rightAllowed').val() > $('.rightList li').length ) {
                msg += '<span>"RIGHT Items" Should not be greater than the items from RIGHT List</span>';
            }            

            if ( msg != '' ) {
                $('.messageCont').html( msg ).show();
            }
        },

        _saveLists: function() {
            var leftArr = this.getListArray('.leftList');
            var rightArr = this.getListArray('.rightList');

            ls.set('leftList', leftArr);
            ls.set('rightList', rightArr);

            ls.set('leftAllowed', $('#leftAllowed').val() );
            ls.set('rightAllowed', $('#rightAllowed').val() );

            ls.set('configured', '1');
        },

        getListArray: function(elemList) {
            var arr = [];
            $(elemList).find('li').each(function( index ) {
                arr.push( $(this).text() );
            });

            return arr;
        },

        renderLists: function() {
            this.createLists('leftList');
            this.createLists('rightList');
        },

        createLists: function(flag) {
            var listArr = ls.get(flag);
            var listStr = '';

            for (var i=0; i<listArr.length; i++) {
                listStr += '<li class="'+flag+'">'+ listArr[i] +'</li>';
            }

            $('.' + flag).html( listStr );
        }
    };

    listObj.ui = {
        initListConfigure: function() {
            $('.listContLeft').addListItems();
            $('.listContRight').addListItems();

            $('.configDone').click(function() {
                listObj.store.saveLists();
            });
        },

        renderListItems: function() {
            if ( ls.get('configured') != 1 ) {
                this.initListConfigure();
            } else {
                $('.addItem, .itemAddCont, .configDone, .listConfig').hide();
                $('.resetAll').show();
                listObj.store.renderLists();
            }

            this.initDragDrop();
        },

        initDragDrop: function() {
            $('.listCont ul').sortable({
                connectWith: '.listCont ul',
                placeholder: 'placeholder',

                start: function( e, ui ) {                  
                },

                stop: function( e, ui ) {
                },

                receive: function( e, ui ) {
                    if ( $( "ul.middleList .leftList" ).length > $('#leftAllowed').val() ) {
                        $(ui.sender).sortable('cancel');
                    }

                    if ( $( "ul.middleList .rightList" ).length > $('#rightAllowed').val() ) {
                        $(ui.sender).sortable('cancel');
                    }

                    if ( ui.item.parent().hasClass('leftList') && ui.item.hasClass("rightList") ) {
                        $(ui.sender).sortable('cancel');
                    }

                    if ( ui.item.parent().hasClass('rightList') && ui.item.hasClass("leftList") ) {
                        $(ui.sender).sortable('cancel');
                    }
                }
            });          

        },

        init: function() {
            this.renderListItems();
        }
    }

})(jQuery);          

jQuery(document).ready(function(){
    listObj.ui.init();
});    