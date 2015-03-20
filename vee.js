/*
Returns the div elements to iterate through, based on the 
current window's URL and the bool parameter.
*/
function getDivs(justHighlighted) {
    if (typeof justHighlighted === 'undefined')
        justHighlighted = false;
    var ret;
    if (window.location.pathname.indexOf('/comments/') > -1)
        ret = justHighlighted ? $('div.highlighted') : $('div.entry:visible');
    else
        ret = justHighlighted ? $('div.highlighted') : $('div.submission');
    return ret;
}

/*
Handle navigating submissions by clicking
*/
$('div.submission,div.entry').on('click', function() {
    if (window.location.pathname == '/' && getDivs().index(this) == 0)
        return false;
    getDivs(true).each(function() {
        $(this).removeClass('highlighted');
    });
    $(this).addClass('highlighted');
});

/*
Handle navigating submissions with the keyboard
*/
$(document).keypress(function(e) {
    switch (e.keyCode) {
        case 113:
            // q - move up
            getDivs().each(function(index) {
                if ($(this).hasClass('highlighted')) {
                    if (index > (window.location.pathname == '/' ? 1 : 0)) {
                        $(this).removeClass('highlighted');
                        getDivs().eq(index - 1).addClass('highlighted');
                        return false;
                    }
                }
            });
            break;
        case 97:
            // a - move down
            var found = false;
            getDivs().each(function(index) {
                if ($(this).hasClass('highlighted')) {
                    $(this).removeClass('highlighted');
                    found = true;
                    getDivs().eq(index + 1).addClass('highlighted');
                    return false;
                }
            });
            if (!found)
                getDivs().eq(window.location.pathname == '/' ? 1 : 0).addClass('highlighted');
            break;
        case 119:
            // w - open link
            getDivs(true).each(function(index) {
                if ($(this).find('a.title').length > 0) {
                    window.open($(this).find('a.title').first().attr('href'));
                    return false;
                }
            });
            break;
        case 115:
            // s - save
            // backburner
            break;
        case 99:
            // c - open comments
            getDivs(true).each(function(index) {
                if ($(this).find('a.comments').length > 0) {
                    window.open($(this).find('a.comments').first().attr('href'));
                    return false;
                }
            });
            break;
        case 114:
            // r - open link and comments
            getDivs(true).each(function(index) {
                if ($(this).find('a.title').length > 0) {
                    var link = $(this).find('a.title').first().attr('href');
                    var comments = $(this).find('a.comments').first().attr('href');
                    window.open(comments);
                    if (link !== comments)
                        window.open(link);
                }
                return false;
            });
            break;
        case 101:
            // e - vote up
            getDivs(true).each(function() {
                if (getDivs().index(this) > (window.location.pathname == '/' ? 1 : 0)) {
                    var arrow = $(this).parent().find('div.unvoted').find('div.arrow-upvote');
                    if (arrow.length > 0)
                        arrow.click();
                    else
                        $(this).parent().find('div.likes').find('div.arrow-upvoted').click();
                    return false;
                }
            });
            break;
        case 100:
            // d - vote down
            getDivs(true).each(function() {
                if (getDivs().index(this) > (window.location.pathname == '/' ? 1 : 0)) {
                    var arrow = $(this).parent().find('div.unvoted').find('div.arrow-downvote');
                    if (arrow.length > 0)
                        arrow.click();
                    else
                        $(this).parent().find('div.likes').find('div.arrow-downvotedd').click();
                    return false;
                }
            });
            break;
    }
});
