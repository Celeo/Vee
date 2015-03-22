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
Load settings button on the homepage
*/
var savedLoaded = false;
$(document).ready(function() {
    if (window.location.pathname == '/') {
        $('div.side>div.spacer').eq(7)
            .after('<div class="spacer"><a id="vee-saved"'
            + 'class="btn-whoaverse btn-block contribute">Saved Links &amp; Comments</a></div>');
        $('#vee-saved').on('click', function() {
            if (savedLoaded === false) {
                var saved = '<div id="vee-saved-items">';
                chrome.storage.local.get('saved', function(items) {
                    if (items !== null && items !== undefined && items.length > 0) {
                        for (i = 0; i < items.length(); i ++) {
                            saved += '<div class="submission link self">'
                                + '<p class="parent"></p>'
                                + '<span class="rank">' + i + '</span>'
                                + '<p class="title">'
                                + '<a class="title may-blank " href="LINK" tabindex="1" title="TITLE">TITLE</a>'
                                + '</p>'
                                + '<p class="tagline">' + item['text'] + '</p><div class="child"></div>'
                                + '<div class="clearleft"><!--IE6fix--></div>';
                        }
                    }
                    else {
                        saved += '<div class="submission link self"><p class="parent"></p><span class="rank"></span><p class="title"><a class="title may-blank " tabindex="1" '
                            + 'title="nothing here">nothing here</a></p><p class="tagline"></p><div class="child"></div><div class="clearleft"><!--IE6fix--></div>';
                    }
                    saved += '</div>'
                    $('div#container').append(saved);
                    savedLoaded = true;
                });
            }
            if ($('a#vee-saved').text() == 'Saved Links & Comments') {
                $('div.sitetable').hide(100);
                $('div#vee-saved-items').show();
                $('a#vee-saved').text('Show main content');
            }
            else {
                $('div#vee-saved-items').hide();
                $('div.sitetable').show(100);
                $('a#vee-saved').text('Saved Links & Comments');
            }
        });
    }
});

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
                arrow.first().click();
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
                arrow.first().click();
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
