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
Custom subverse list for the top bar
*/
$(document).ready(function() {
    $('ul#sr-bar').html('');
});

/*
Load saved items button on the homepage and handle (un)saving items
*/
$(document).ready(function() {
    if (window.location.pathname == '/') {
        // add the button to show the saved items to the sidebar
        $('div.side>div.spacer').eq(7)
            .after('<div class="spacer"><a id="vee-saved"'
            + 'class="btn-whoaverse btn-block contribute">Saved Links &amp; Comments</a></div>');
        // listener for that button being clicked
        $('#vee-saved').on('click', function() {
            // if the button's text is to show the saved items,
            if ($('a#vee-saved').text() == 'Saved Links & Comments') {
                // start building the HTML
                var saved = '<div id="vee-saved-items"><h1>Saved items</h1>';
                // load the saved items from storage
                chrome.storage.local.get('saved', function(items) {
                    // if there is anything previously stored,
                    if (items !== null && items !== undefined && items['saved'] !== undefined && items['saved'].length > 0) {
                        // iterate through each of them and add them to the HTML being built
                        for (i = 0; i < items['saved'].length; i ++) {
                            saved += '<div class="submission link self">'
                                + '<p class="parent"></p>'
                                + '<p class="title">'
                                + '<a class="title may-blank " href="' + items['saved'][i]['link'] + '" tabindex="1" title="'
                                + items['saved'][i]['title'] + '">' + items['saved'][i]['title'] + '</a>'
                                + '<span class="domain">(<a href="' + items['saved'][i]['place'] + '">' + items['saved'][i]['place'] + '</a>)</span>'
                                + '</p><p class="tagline">' + items['saved'][i]['info'] + '</p><div class="child"></div>'
                                + '<div class="clearleft"><!--IE6fix--></div>';
                        }
                    }
                    else {
                        // otherwise, there's nothing in storage
                        saved += '<div class="submission link self"><p class="parent"></p><span class="rank"></span><p class="title"><a class="title may-blank " tabindex="1" '
                            + 'title="nothing here">nothing here</a></p><p class="tagline"></p><div class="child"></div><div class="clearleft"><!--IE6fix--></div>';
                    }
                    // finish off the HTML
                    saved += '</div>';
                    // remove any previously-loaded HTML readout
                    $('div#vee-saved-items').remove();
                    // and insert out HTML into the page
                    $('div#container').append(saved);
                });
                // hide the main contents
                $('div.sitetable').hide(100);
                // and show out saved items HTML
                $('div#vee-saved-items').show();
                // switch the button text so we know to reverse this process next time
                $('a#vee-saved').text('Show main content');
            }
            else {
                // hide out saved items readout
                $('div#vee-saved-items').hide();
                // and bring back the main content
                $('div.sitetable').show(100);
                // and switch the button text back
                $('a#vee-saved').text('Saved Links & Comments');
            }
        });
    }
    // add save links to all link panels under submissions and comments
    $('ul.flat-list.buttons').append('<li><a class="vee-save" title="save with Vee">save</a></li>');
    // check to see if there are any previously-saved items
    chrome.storage.local.get('saved', function(items) {
        // iterate through all of them, checking to see if they are on the currently-loaded page
        for (i = 0; i < items['saved'].length; i ++) {
            $('a.vee-save').each(function() {
                // if this saved item is on the page,
                if ($(this).parent().parent().find('li').first().find('a').attr('href') == items['saved'][i]['link']) {
                    // turn its save link text into 'unsave'
                    $(this).text('unsave');
                }
            });
        }
    });
    // listener for a (un)save link being clicked
    $('.vee-save').on('click', function() {
        // store the jQuery object for when `this` is changed in the processing below
        var linkObj = $(this);
        // if we're to save the item
        if ($(this).text() == 'save') {
            // fetch the needed inforamtion
            var link = $(this).parent().parent().find('li').first().find('a').attr('href');
            var title = $(this).parent().parent().parent().find('a.title').text();
            var place = $(this).parent().parent().parent().find('a').eq(1).text();
            // if `title` is blank, then this a comment - get different information
            if (title == '') {
                title = '/u/' + place + ' commented on "' + $('a.title').first().text() + '"';
                var urlSplit = link.split('/');
                place = [urlSplit[1], urlSplit[2], urlSplit[3], urlSplit[4]].join('/');
            }
            // get the date this is being saved
            var now = new Date();
            var info = 'saved at ' +
                [[now.getMonth() + 1, now.getDate(), now.getFullYear()].join("/") + ',', [now.getHours(),
                now.getMinutes()].join(':'), now.getHours() >= 12 ? 'PM' : 'AM'].join(' ');
            // get the saved items from storage
            chrome.storage.local.get('saved', function(items) {
                // if nothing has been saved before,
                if (items == null || items == undefined || items['saved'] == undefined || items['saved'].length < 1) {
                    // start off the storage fresh
                    items = [{link: link, title: title, place: place, info: info}];
                    // insert into storage
                    chrome.storage.local.set({'saved': items}, function() {
                        // turn the link into a unsave link
                        $(linkObj).text('unsave');
                    });
                }
                else {
                    // otherwise, append this item to the previously-saved items
                    items['saved'].push({link: link, title: title, place: place, info: info});
                    // and store back into storage
                    chrome.storage.local.set({'saved': items['saved']}, function() {
                        // turn the link into a unsave link
                        $(linkObj).text('unsave');
                    });
                }
            });
        }
        else {
            // unsave link
            // get the link from the surrounding div
            var link = $(this).parent().parent().find('li').first().find('a').attr('href');
            // get the saved items from storage
            chrome.storage.local.get('saved', function(items) {
                // search for this one
                for (i = 0; i < items['saved'].length; i ++) {
                    if (items['saved'][i]['link'] == link)
                        // and remove it from the array
                        items['saved'].splice(i, 1);
                }
                // save the items back into storage
                chrome.storage.local.set({'saved': items['saved']}, function() {});
            });
            // and turn the link back into a save link
            $(this).text('save');
        }
    });
});

/*
Handle navigating submissions by clicking
*/
$('div.submission').on('click', function() {
    // if this is the homepage, ignore the featured sub link
    if (window.location.pathname == '/' && getDivs().index(this) == 0)
        return true;
    // if this is a submission's comments page, ignore all submission divs that aren't the actual submission
    if (window.location.pathname.indexOf('/comments/') > -1)
        return true;
    // clear highlighting on all divs
    getDivs(true).each(function() {
        clearHighlighting();
    });
    // highlight this div
    $(this).addClass('highlighted');
});
$('div.entry').on('click', function() {
    // if this is the homepage, ignore the featured sub link
    if (window.location.pathname == '/' && $('div.entry').index(this) == 0)
        return true;
    // clear highlighting on all divs
    getDivs(true).each(function() {
        clearHighlighting();
    });
    // highlight this div
    $(this).addClass('highlighted');
});

/*
Handle navigating submissions with the keyboard
*/
$(document).keypress(function(e) {
    // the target will be the body element unless the user is typing into an input
    if (event.target.tagName !== "BODY")
        // don't activate hotkeys when the user is typing
        return;
    switch (e.keyCode) {
        case 113:
            // q - move up
            // for each possible div,
            getDivs().each(function(index) {
                // if it's highlighted,
                if ($(this).hasClass('highlighted')) {
                    // and not before the first valid div on the page,
                    if (index > (window.location.pathname == '/' ? 1 : 0)) {
                        // clear highlighting for all divs
                        clearHighlighting();
                        // and highlight this div
                        getDivs().eq(index - 1).addClass('highlighted');
                        // break from the each
                        return false;
                    }
                }
            });
            break;
        case 97:
            // a - move down
            var found = false;
            // for each possible div,
            getDivs().each(function(index) {
                // if it's highlighted,
                if ($(this).hasClass('highlighted')) {
                    // clear highlighting for all divs
                    clearHighlighting();
                    // mark that we found it
                    found = true;
                    // and highlight this div
                    getDivs().eq(index + 1).addClass('highlighted');
                    // break from the each
                    return false;
                }
            });
            // if nothing was found (nothing highlighted), then highlight the first valid div on the page
            if (!found)
                getDivs().eq(window.location.pathname == '/' ? 1 : 0).addClass('highlighted');
            break;
        case 119:
            // w - open link
            getDivs(true).each(function() {
                // if there's a title link,
                if ($(this).find('a.title').length > 0) {
                    // open it
                    window.open($(this).find('a.title').first().attr('href'));
                    // break from the each
                    return false;
                }
            });
            break;
        case 115:
            // s - save
            getDivs(true).each(function() {
                // click the (un)save link
                $(this).find('a.vee-save').first().click();
                // break from the each
                return false;
            });
            break;
        case 99:
            // c - open comments
            getDivs(true).each(function() {
                // if there's a comments link,
                if ($(this).find('a.comments').length > 0) {
                    // open it
                    window.open($(this).find('a.comments').first().attr('href'));
                    // break from the each
                    return false;
                }
            });
            break;
        case 114:
            // r - open link and comments
            getDivs(true).each(function(index) {
                // if there's a title link,
                if ($(this).find('a.title').length > 0) {
                    // get it
                    var link = $(this).find('a.title').first().attr('href');
                    // and get the comments link
                    var comments = $(this).find('a.comments').first().attr('href');
                    // open the comments link
                    window.open(comments);
                    // if the links aren't the same,
                    if (link !== comments)
                        // open the title link too
                        window.open(link);
                }
                // break from the each
                return false;
            });
            break;
        case 101:
            // e - vote up
            getDivs(true).each(function() {
                // search for the up arrow
                var arrow;
                if (window.location.pathname.indexOf('/comments/') > -1)
                    arrow = $(this).parent().find('div[class*="arrow-upvote"]');
                else
                    arrow = $(this).find('div[class*="arrow-upvote"]');
                // and click it
                arrow.first().click();
                // break from the each
                return false;
            });
            break;
        case 100:
            // d - vote down
            getDivs(true).each(function() {
                // search for the down arrow
                var arrow;
                if (window.location.pathname.indexOf('/comments/') > -1)
                    arrow = $(this).parent().find('div[class*="arrow-downvote"]');
                else
                    arrow = $(this).find('div[class*="arrow-downvote"]');
                // and click it
                arrow.first().click();
                // break from the each
                return false;
            });
            break;
        case 122:
            // z - expand/contract images/videos
            // get all matching links
            getDivs(true).each(function() {
                // and click them
                $(this).find('.link-expando-type').click();
            });
            break;
    }
});
