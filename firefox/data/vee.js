/*
Firefox
*/
var data = require('sdk/simple-storage');

/*
Returns the div elements to iterate through, based on the 
current window's URL and the bool parameter.
*/
function getDivs(justHighlighted) {
    if (typeof justHighlighted === 'undefined')
        justHighlighted = false;
    var ret;
    if (window.location.pathname.indexOf('/comments/') > -1)
        ret = justHighlighted ? $('div.vee-highlighted') : $('div.entry:visible');
    else
        ret = justHighlighted ? $('div.vee-highlighted') : $('div.submission');
    return ret;
}

/*
Removes highlighting from all divs
*/
function clearHighlighting() {
    getDivs(true).each(function() {
        $(this).removeClass('vee-highlighted');
    });
}

/*
Returns the name of the subverse
*/
function getSubverseName() {
    return $('a.subverse').first().text();
}

/*
Custom subverse list for the top bar
*/
$(document).ready(function() {
    // replace top bar with custom list
    var subs = '';
    // if it exists,
    if (data.storage.subs) {
        // add each as a list element to the string
        for (i = 0; i < data.storage.subs.length; i ++) {
            subs += '<li class=""><span class="separator">-</span><a href="/v/'
                + data.storage.subs[i] + '/">' + data.storage.subs[i] + '</a></li>';
        }
        // add subverse to list if not the homepage
        if (window.location.pathname !== '/') {
            if (data.storage.subs.indexOf(getSubverseName()) > -1)
                $('button.btn-whoaverse-paging.btn-xs.btn-default').first()
                    .after('<button class="btn-whoaverse-paging btn-xs btn-default vee-sub-mod">- sub list</button>');
            else
                $('button.btn-whoaverse-paging.btn-xs.btn-default').first()
                    .after('<button class="btn-whoaverse-paging btn-xs btn-default vee-sub-mod">+ sub list</button>');
        }
    }
    else {
        // add subverse to list if not the homepage
        if (window.location.pathname !== '/') {
            $('button.btn-whoaverse-paging.btn-xs.btn-default').first()
                .after('<button class="btn-whoaverse-paging btn-xs btn-default vee-sub-mod">+ sub list</button>');
        }
    }
    // replace the top bar with the HTML build (or blank)
    // so long as there are selected subs (otherwise show the default bar)
    if (subs !== '')
        $('ul#sr-bar').html(subs);
    // handler for clicking the sublist mod button
    $('button.vee-sub-mod').on('click', function() {
        // if we're to add this to the list
        if ($(this).text().lastIndexOf('+', 0) === 0) {
            if (data.storage.subs) {
                if (data.storage.subs.length === 0)
                    $('ul#sr-bar').html('');
                data.storage.subs.push(getSubverseName());
                $('ul#sr-bar').append('<li class=""><span class="separator">-</span><a href="/v/'
                    + getSubverseName() + '/">' + getSubverseName() + '</a></li>');
                $(this).text('- sub list');
            }
            else {
                data.storage.subs = [getSubverseName()];
                $('ul#sr-bar').find('li').each(function(index) {
                    if ($(this).find('a').first().text() == getSubverseName()) {
                        $(this).remove();
                        return false;
                    }
                });
                $(this).text('+ sub list');
            }
        }
        else {
            data.storage.subs.splice(data.storage.subs.indexOf(getSubverseName()), 1);
            $('ul#sr-bar').find('li').each(function(index) {
                if ($(this).find('a').first().text() == getSubverseName()) {
                    $(this).remove();
                    return false;
                }
            });
            $(this).text('+ sub list');
        }
    });
});

/*
User tags
*/
$(document).ready(function() {
    // if there are tags from storage,
    if (data.storage.saved !== undefined) {
        // append the appropriate tags to author links currently on the page
        $('a.author').each(function() {
            // if this user has a tag,
            if ($(this).text() in data.storage.saved)
                // add it
                $(this).after('<span class="vee-user-tag">' + data.storage.saved[$(this).text()] + '</span><img src="'
                    + chrome.extension.getURL('tag_10.png') + '" class="vee-user-tag-tag">');
            else
                // otherwise, just show the tag icon link
                $(this).after('<span class="vee-user-tag" style="display: none;"></span><img src="'
                    + chrome.extension.getURL('tag_10.png') + '" class="vee-user-tag-tag">');
        });
    }
    else {
        // no tags - just show the tag icon link
        $('a.author').each(function() {
            $(this).after('<span class="vee-user-tag" style="display: none;"></span><img src="'
                + chrome.extension.getURL('tag_10.png') + '" class="vee-user-tag-tag">');
        });
    }
    // when the X button on the floating window is clicked,
    $('a#vee-user-tag-edit-cancel').on('on', function() {
        // delete the floating window
        $('div.vee-user-tag-edit').remove();
    });
    // when a tag icon is clicked,
    $('img.vee-user-tag-tag').on('click', function() {
        // popup an editing window
        $(this).after('<div class="vee-user-tag-edit" style="left: '
            + ($(this).position().left + 10) + 'px; top: ' + ($(this).position().top + 10) + 'px;">'
            + '<span>' + $(this).prev().prev().text() + '</span>'
            + '<h2>Tag for ' + $(this).prev().prev().text() + '</h2>'
            + '<a onclick="$(this).parent().remove();">X</a>'
            + '<input type="text" placeholder="tag"><br />'
            + '<button id="vee-user-tag-edit-set">Set</button>'
            + '</div>');
        // when the save button is clicked,
        $('button#vee-user-tag-edit-set').on('click', function() {
            // if this is the first tag
            if (!('tags' in tags)) {
                // make an entry in the dictionary
                tags = {};
                data.storage.saved = [];
            }
            // set the value
            data.storage.saved[$('div.vee-user-tag-edit').find('span').text()] = $('div.vee-user-tag-edit').find('input').val();
            // store the new tag back into storage
            $('div.vee-user-tag-edit').prev().prev().css('visibility', 'visible');
            $('div.vee-user-tag-edit').prev().prev().text($('div.vee-user-tag-edit').find('input').val());
            $('div.vee-user-tag-edit').prev().prev().show();
            $('div.vee-user-tag-edit').remove();
        });
    });
});

/*
Add and handle hide links
*/
$(document).ready(function() {
    // if the user is on the main page, add a button to show all hidden links
    if (window.location.pathname == '/') {
        // add the button to show the saved items to the sidebar
        $('div.side>div.spacer').eq(8)
            .after('<div class="spacer"><a id="vee-hidden"'
            + 'class="btn-whoaverse btn-block contribute">Hidden submissions</a></div>');
        // listener for that button being clicked
        $('#vee-hidden').on('click', function() {
            // if the button's text is to show the saved items,
            if ($('a#vee-hidden').text() == 'Hidden submissions') {
                // start building the HTML
                var hidden = '<div id="vee-hidden-items"><h1>Hidden submission</h1>';
                // if there is anything previously stored,
                if (data.storage.hidden) {
                    // iterate through each of them and add them to the HTML being built
                    for (i = 0; i < data.storage.hidden.length; i ++) {
                        // get the subverse from the Voat API
                        $.ajax({
                            url: 'https://voat.co/api/singlesubmission?id=' + data.storage.hidden[i],
                            dataType: 'json',
                            success: function(data) {
                                hidden += '<div class="submission link self">'
                                    + '<p class="parent"></p>'
                                    + '<p class="title">'
                                    + '<a class="title may-blank " href="/v/' + data['Subverse'] + '/comments/' + data.storage.hidden[i] + '" tabindex="1" title="'
                                    + data['Title'] + '">' + data['Title'] + '</a>'
                                    + '<span class="domain">(<a href="/v/' + data['Subverse'] + '/comments/' + data.storage.hidden[i] + '">' + data['Subverse'] + '</a>)</span>'
                                    + '</p><p class="tagline"></p><div class="child"></div>'
                                    + '<div class="clearleft"><!--IE6fix--></div>';
                            },
                            // make the Ajax calls synchronous
                            async: false
                        });
                    }
                }
                else {
                    // otherwise, there's nothing in storage
                    hidden += '<div class="submission link self"><p class="parent"></p><span class="rank"></span><p class="title"><a class="title may-blank " tabindex="1" '
                        + 'title="nothing here">nothing here</a></p><p class="tagline"></p><div class="child"></div><div class="clearleft"><!--IE6fix--></div>';
                }
                // finish off the HTML
                hidden += '</div>';
                // remove any previously-loaded HTML readout
                $('div#vee-hidden-items').remove();
                // and insert out HTML into the page
                $('div#container').append(hidden);
                // hide the main contents
                $('div.sitetable').hide(100);
                // and show out hidden items HTML
                $('div#vee-hidden-items').show();
                // switch the button text so we know to reverse this process next time
                $('a#vee-hidden').text('Show main content');
            }
            else {
                // hide out saved items readout
                $('div#vee-hidden-items').hide();
                // and bring back the main content
                $('div.sitetable').show(100);
                // and switch the button text back
                $('a#vee-hidden').text('Hidden submissions');
            }
        });
    }
    // add hide links to submissions
    if (window.location.pathname.indexOf('/comments/') > -1)
        $('ul.flat-list.buttons').first().append('<li><a class="vee-hide" title="hide with Vee">hide</a></li>');
    else
        $('ul.flat-list.buttons').append('<li><a class="vee-hide" title="hide with Vee">hide</a></li>');
    // check to see if there are any previously-hidden items
    if (items !== null && items !== undefined && data.storage.hidden !== undefined && data.storage.hidden.length > 0) {
        // iterate through all of them, checking to see if they are on the currently-loaded page
        // if this is a comments page
        var commentsPage = window.location.pathname.indexOf('/comments/') > -1;
        for (i = 0; i < data.storage.hidden.length; i ++) {
            $('a.vee-hide').each(function() {
                // submission id
                var submissionId;
                if (commentsPage)
                    submissionId = $(this).parent().parent().parent().parent().attr('id').split('-')[1];
                else
                    submissionId = $(this).parent().parent().parent().parent().attr('data-fullname');
                // if this hidden item is on the page,
                if (submissionId == data.storage.hidden[i]) {
                    if (commentsPage) {
                        // show unhide link
                        $('a.vee-hide').text('unhide');
                    }
                    else {
                        // hide the div
                        $(this).parent().parent().parent().parent().first().hide(100);
                    }
                }
            });
        }
    }
    // listener for hide links
    $('a.vee-hide').on('click', function() {
        // get the id of the surrounding div
        var linkObj = $(this);
        // if this is a comments page
        var commentsPage = window.location.pathname.indexOf('/comments/') > -1;
        // if the item is to be hidden
        var doHide = linkObj.text() == 'hide';
        // submission id
        var submissionId;
        if (commentsPage)
            submissionId = linkObj.parent().parent().parent().parent().attr('id').split('-')[1];
        else
            submissionId = linkObj.parent().parent().parent().parent().attr('data-fullname');
        // if there are other entries in storage
        if (!(items == null || items == undefined || data.storage.hidden == undefined || data.storage.hidden.length < 1)) {
            if (doHide) {
                // if there are other entries and we're hiding this item,
                // add it to the list
                data.storage.hidden.push(submissionId);
            }
            else if(commentsPage) {
                // if we're unhiding this item,
                // remove it from the list
                data.storage.hidden.splice(data.storage.hidden.indexOf(submissionId), 1);
            }
        }
        else if (doHide) {
            // set the item as the list
            data.storage.hidden = [submissionId];
        }
        // set the text
        linkObj.text(doHide ? 'unhide' : 'hide');
        // on success, if this isn't a comments page,
        if (!commentsPage)
            // hide the submission
            linkObj.parent().parent().parent().parent().first().hide(100);
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
    $(this).addClass('vee-highlighted');
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
    $(this).addClass('vee-highlighted');
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
            var found = false;
            // for each possible div,
            getDivs().each(function(index) {
                // if it's highlighted,
                if ($(this).hasClass('vee-highlighted')) {
                    // and not before the first valid div on the page,
                    if (index > (window.location.pathname == '/' ? 1 : 0)) {
                        // clear highlighting for all divs
                        clearHighlighting();
                        // mark that we found it
                        found = true;
                        // and highlight this div
                        getDivs().eq(index - 1).addClass('vee-highlighted');
                        // break from the each
                        return false;
                    }
                }
            });
            // if nothing was found (nothing highlighted), then highlight the first valid div on the page
            if (!found)
                getDivs().eq(window.location.pathname == '/' ? 1 : 0).addClass('vee-highlighted');
            break;
        case 97:
            // a - move down
            var found = false;
            // for each possible div,
            getDivs().each(function(index) {
                // if it's highlighted,
                if ($(this).hasClass('vee-highlighted')) {
                    // clear highlighting for all divs
                    clearHighlighting();
                    // mark that we found it
                    found = true;
                    // and highlight this div
                    getDivs().eq(index + 1).addClass('vee-highlighted');
                    // break from the each
                    return false;
                }
            });
            // if nothing was found (nothing highlighted), then highlight the first valid div on the page
            if (!found)
                getDivs().eq(window.location.pathname == '/' ? 1 : 0).addClass('vee-highlighted');
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
