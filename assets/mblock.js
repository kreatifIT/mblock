/**
 * Created by joachimdoerr on 30.07.16.
 */
$(function () {
    mblock_init();
    $(document).on('pjax:end', function() {
        mblock_init();
    });
});

function mblock_init() {
    var mblock = $('.mblock_wrapper');
    // init by siteload
    if ($('#REX_FORM').length && mblock.length) {
        mblock.each(function(){
            // alert('test1');
            mblock_sort($(this));
        });
    }
}

// List with handle
function mblock_init_sort(element) {
    // reindex
    mblock_reindex(element);
    // init
    mblock_sort(element);
}

function mblock_sort(element) {
    // add linking
    mblock_add(element);
    // remove mblock_remove
    mblock_remove(element);
    // init sortable
    mblock_sortable(element);
}

function mblock_remove(element) {
    var finded = element.find('> div');

    if (finded.length == 1) {
        finded.find('.removeme').prop('disabled', true);
    } else {
        finded.find('.removeme').prop('disabled', false);
    }

    // has data?
    if(element.data().hasOwnProperty('max')) {
        if (finded.length >= element.data('max')) {
            element.find('.addme').prop('disabled', true);
        } else {
            element.find('.addme').prop('disabled', false);
        }
    }

    if(element.data().hasOwnProperty('min')) {
        if (finded.length <= element.data('min')) {
            element.find('.removeme').prop('disabled', true);
        } else {
            element.find('.removeme').prop('disabled', false);
        }
    }

    finded.each(function(index){
        // min removeme hide
        if ((index+1)==element.data('min') && finded.length == element.data('min')) {
            $(this).find('.removeme').prop('disabled', true);
        }
        if (index==0) {
            $(this).find('.moveup').prop('disabled', true);
        } else {
            $(this).find('.moveup').prop('disabled', false);
        }
        if ((index + 1)== finded.length) { // if max count?
            $(this).find('.movedown').prop('disabled', true);
        } else {
            $(this).find('.movedown').prop('disabled', false);
        }
    });
}

function mblock_sortable(element) {
    element.sortable({
        handle: '.sorthandle',
        animation: 150,
        onEnd: function () {
            mblock_reindex(element);
        }
    });
}

function mblock_reindex(element) {
    // remove mblock_remove
    mblock_remove(element);

    var initredactor = false;

    element.find('> div').each(function(index) {
        // find input elements
        $(this).find('input,textarea,select').each(function(key) {
            var attr = $(this).attr('name');
            eindex = key + 1;
            sindex = index + 1;
            // For some browsers, `attr` is undefined; for others,
            // `attr` is false. Check for both.
            if (typeof attr !== typeof undefined && attr !== false) {
                var value = $(this).attr('name').replace($(this).attr('name').match(/\]\[\d+\]\[/g), '][' + index + '][');
                $(this).attr('name', value);
            }

            if ($(this).attr('id')) {
                mblock_replace_for(element, $(this), index);
            }

            // select rex button
            if ($(this).prop("nodeName") == 'SELECT' && (
                    $(this).attr('id').indexOf("REX_MEDIALIST_SELECT_") >= 0 ||
                    $(this).attr('id').indexOf("REX_LINKLIST_SELECT_") >= 0
                )) {
                $(this).parent().data('eindex', eindex);
                $(this).attr('id', $(this).attr('id').replace(/_\d+/, '_' + sindex + '00' + eindex));
                if ($(this).attr('name') != undefined) {
                    $(this).attr('name', $(this).attr('name').replace(/_\d+/, '_' + sindex + '00' + eindex));
                }
            }

            // input rex button
            if ($(this).prop("nodeName") == 'INPUT' && (
                    $(this).attr('id').indexOf("REX_LINK_") >= 0 ||
                    $(this).attr('id').indexOf("REX_LINKLIST_") >= 0 ||
                    $(this).attr('id').indexOf("REX_MEDIA_") >= 0 ||
                    $(this).attr('id').indexOf("REX_MEDIALIST_") >= 0
                )) {
                if ($(this).parent().data('eindex')) {
                    eindex = $(this).parent().data('eindex');
                }
                $(this).attr('id', $(this).attr('id').replace(/\d+/, sindex + '00' + eindex));
                // button
                $(this).parent().find('a.btn-popup').each(function(){
                    $(this).attr('onclick', $(this).attr('onclick').replace(/\(\d+/, '(' + sindex + '00' + eindex));
                    $(this).attr('onclick', $(this).attr('onclick').replace(/_\d+/, '_' + sindex + '00' + eindex));
                });
            }
        });

        $(this).find('.redactor-box').each(function(key){
            initredactor = true;
            eindex = key + 1;
            sindex = index + 1;
            $(this).find('textarea').each(function(){
                if($(this).attr('id')) {
                    $(this).attr('id', $(this).attr('id').replace(/\d+/, sindex + '00' + eindex));
                }
            });
        });

    });

    if (initredactor) {

        $('.redactor-box').each(function(){
            var area;
            var content = '';
            $(this).find('div.redactor-in').each(function () {
                if ($(this).attr('role')) {
                    content = $(this).html();
                }
            });
            if (element.data('input_delete') == true && $(this).closest('div[class^="sortitem"]').length) {
                content = '';
            }
            $(this).find('textarea').each(function(){
                if($(this).attr('id')) {
                    // copy content
                    area = $(this).clone().css('display','block');
                }
            });
            if (area.length) {
                initredactor = true;
                $(this).parent().append(area);
                $(this).parent().find('textarea').val(content);
                $(this).remove();
            }
        });

        if(typeof redactorInit === 'function') redactorInit();
    }
}

function mblock_replace_for(element, item, index) {
    if (item.attr('id').indexOf("REX_MEDIA") >= 0 ||
        item.attr('id').indexOf("REX_LINK") >= 0 ||
        item.attr('id').indexOf("redactor") >= 0
    ) { } else {
        item.attr('id', item.attr('id').replace(/_\d_+/, '_' + index + '_'));
        if (item.parent().find('label').length) {
            label = item.parent().find('label');
        }
        if (item.parent().parent().find('label').length) {
            label = item.parent().parent().find('label');
        }
        if (label.length) {
            label.attr('for', label.attr('for').replace(/_\d_+/, '_' + index + '_'));
        }
    }
    mblock_replace_checkbox_for(element);
}

function mblock_replace_checkbox_for(element) {
    element.find('input:checkbox').each(function() {
        $(this).parent().find('label').attr('for', $(this).attr('id'));
    });
}

function mblock_add_item(element, item) {
    if (item.parent().hasClass(element.attr('class'))) {
        // unset sortable
        element.sortable("destory");
        // add element
        item.after(item.clone());

        if(element.data().hasOwnProperty('input_delete')) {
            if (element.data('input_delete') == true) {
                item.next().find('input, textarea').val('');
                item.next().find('option:selected').removeAttr("selected");
                item.next().find('input:checked').removeAttr("checked");
                item.next().find('select').each(function () {
                    if ($(this).attr('id').indexOf("REX_MEDIALIST") >= 0
                        || $(this).attr('id').indexOf("REX_LINKLIST") >= 0
                    ) {
                        $(this).find('option').remove();
                    }
                });
            }
        }

        // reinit
        mblock_init_sort(element);
    }
}

function mblock_remove_item(element, item) {
    if (item.parent().hasClass(element.attr('class'))) {
        // unset sortable
        element.sortable("destory");
        // remove element
        item.remove();
        // reinit
        mblock_init_sort(element);
    }
}

function mblock_moveup(element, item) {
    var prev = item.prev();
    if (prev.length == 0) return;
    prev.css('z-index', 99).addClass('mblock_animate').css({ 'position': 'relative', 'top': item.outerHeight(true) });
    item.css('z-index', 100).addClass('mblock_animate').css({ 'position': 'relative', 'top': - prev.outerHeight(true) });

    setTimeout(function(){
        prev.removeClass('mblock_animate').css({ 'z-index': '', 'top': '', 'position': '' });
        item.removeClass('mblock_animate').css({ 'z-index': '', 'top': '', 'position': '' });
        item.insertBefore(prev);
        mblock_reindex(element);
    },150);
}

function mblock_movedown(element, item) {
    var next = item.next();
    if (next.length == 0) return;

    next.css('z-index', 99).addClass('mblock_animate').css({ 'position': 'relative', 'top': - item.outerHeight(true) });
    item.css('z-index', 100).addClass('mblock_animate').css({ 'position': 'relative', 'top': next.outerHeight(true) });

    setTimeout(function(){
        next.removeClass('mblock_animate').css({ 'z-index': '', 'top': '', 'position': '' });
        item.removeClass('mblock_animate').css({ 'z-index': '', 'top': '', 'position': '' });
        item.insertAfter(next);
        mblock_reindex(element);
    },150);
}

function mblock_add(element) {
    element.find('> div .addme').unbind().bind('click', function() {
        if (!$(this).prop('disabled')) {
            mblock_add_item(element, $(this).closest('div[class^="sortitem"]'));
        }
        return false;
    });
    element.find('> div .removeme').unbind().bind('click', function() {
        if (!$(this).prop('disabled')) {
            mblock_remove_item(element, $(this).closest('div[class^="sortitem"]'));
        }
        return false;
    });
    element.find('> div .moveup').unbind().bind('click', function() {
        if (!$(this).prop('disabled')) {
            mblock_moveup(element, $(this).closest('div[class^="sortitem"]'));
        }
        return false;
    });
    element.find('> div .movedown').unbind().bind('click', function() {
        if (!$(this).prop('disabled')) {
            mblock_movedown(element, $(this).closest('div[class^="sortitem"]'));
        }
        return false;
    });
}