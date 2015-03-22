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
Removes highlighting from all divs
*/
function clearHighlighting() {
    getDivs(true).each(function() {
        $(this).removeClass('highlighted');
    });
}

/*
Handle navigating submissions by clicking
*/
$('div.submission').on('click', function() {
    if (window.location.pathname == '/' && getDivs().index(this) == 0)
        return true;
    if (window.location.pathname.indexOf('/comments/') > -1)
        return true;
    getDivs(true).each(function() {
        clearHighlighting();
    });
    $(this).addClass('highlighted');
});
$('div.entry').on('click', function() {
    if (window.location.pathname == '/' && $('div.entry').index(this) == 0)
        return true;
    getDivs(true).each(function() {
        clearHighlighting();
    });
    $(this).addClass('highlighted');
});

/*
Handle navigating submissions with the keyboard
*/
$(document).keypress(function(e) {
    if (event.target.tagName !== "BODY")
        return;
    switch (e.keyCode) {
        case 113:
            // q - move up
            getDivs().each(function(index) {
                if ($(this).hasClass('highlighted')) {
                    if (index > (window.location.pathname == '/' ? 1 : 0)) {
                        clearHighlighting();
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
                    clearHighlighting();
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
                var arrow;
                if (window.location.pathname.indexOf('/comments/') > -1)
                    arrow = $(this).parent().find('div[class*="arrow-upvote"]');
                else
                    arrow = $(this).find('div[class*="arrow-upvote"]');
                arrow.click();
                return false;
            });
            break;
        case 100:
            // d - vote down
            getDivs(true).each(function() {
                var arrow;
                if (window.location.pathname.indexOf('/comments/') > -1)
                    arrow = $(this).parent().find('div[class*="arrow-downvote"]');
                else
                    arrow = $(this).find('div[class*="arrow-downvote"]');
                arrow.click();
                return false;
            });
            break;
        case 122:
            // z - expand/contract images/videos
            getDivs(true).each(function() {
                $(this).find('.link-expando-type').click();
            });
            break;
    }
});
