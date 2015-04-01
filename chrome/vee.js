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
    // load custom sub list from storage
    chrome.storage.local.get('subs', function(items) {
        // if it exists,
        if ('subs' in items) {
            // add each as a list element to the string
            for (i = 0; i < items['subs'].length; i ++) {
                subs += '<li class=""><span class="separator">-</span><a href="/v/'
                    + items['subs'][i] + '/">' + items['subs'][i] + '</a></li>';
            }
            // add subverse to list if not the homepage
            if (window.location.pathname !== '/') {
                if (items['subs'].indexOf(getSubverseName()) > -1)
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
                if ('subs' in items) {
                    if (items['subs'].length === 0)
                        $('ul#sr-bar').html('');
                    items['subs'].push(getSubverseName());
                    $('ul#sr-bar').append('<li class=""><span class="separator">-</span><a href="/v/'
                        + getSubverseName() + '/">' + getSubverseName() + '</a></li>');
                    $(this).text('- sub list');
                }
                else {
                    items['subs'] = [getSubverseName()];
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
                items['subs'].splice(items['subs'].indexOf(getSubverseName()), 1);
                $('ul#sr-bar').find('li').each(function(index) {
                    if ($(this).find('a').first().text() == getSubverseName()) {
                        $(this).remove();
                        return false;
                    }
                });
                $(this).text('+ sub list');
            }
            chrome.storage.local.set({'subs': items['subs']}, function() {});
        });
    });
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
        if ('saved' in items) {
            for (i = 0; i < items['saved'].length; i ++) {
                $('a.vee-save').each(function() {
                    // if this saved item is on the page,
                    if ($(this).parent().parent().find('li').first().find('a').attr('href') == items['saved'][i]['link']) {
                        // turn its save link text into 'unsave'
                        $(this).text('unsave');
                    }
                });
            }
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

// local memory storage of tags
var tags;
// get tags from storage
chrome.storage.local.get('tags', function(items) {
    // set to local reference
    tags = items;
    // if there are tags from storage,
    if (tags['tags'] !== undefined) {
        // append the appropriate tags to author links currently on the page
        $('a.author').each(function() {
            // if this user has a tag,
            if ($(this).text() in tags['tags'])
                // add it
                $(this).after('<span class="vee-user-tag">' + tags['tags'][$(this).text()] + '</span><img src="'
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
                tags['tags'] = [];
            }
            // set the value
            tags['tags'][$('div.vee-user-tag-edit').find('span').text()] = $('div.vee-user-tag-edit').find('input').val();
            // store the new tag back into storage
            chrome.storage.local.set({'tags': tags['tags']}, function() {
                $('div.vee-user-tag-edit').prev().prev().css('visibility', 'visible');
                $('div.vee-user-tag-edit').prev().prev().text($('div.vee-user-tag-edit').find('input').val());
                $('div.vee-user-tag-edit').prev().prev().show();
                $('div.vee-user-tag-edit').remove();
            });
        });
    });
});

/*
Add and handle hide links
*/
$(document).ready(function() {
    chrome.storage.local.remove('hidden'); // TODO remove
    // add hide links to submissions
    if (window.location.pathname.indexOf('/comments/') > -1)
        $('ul.flat-list.buttons').first().append('<li><a class="vee-hide" title="hide with Vee">hide</a></li>');
    else
        $('ul.flat-list.buttons').append('<li><a class="vee-hide" title="hide with Vee">hide</a></li>');
    // check to see if there are any previously-hidden items
    chrome.storage.local.get('hidden', function(items) {
        if (items !== null && items !== undefined && items['hidden'] !== undefined && items['hidden'].length > 0) {
            // iterate through all of them, checking to see if they are on the currently-loaded page
            for (i = 0; i < items['hidden'].length; i ++) {
                console.log('looking to hide div id ' + items['hidden'][i]);
                $('a.vee-hide').each(function() {
                    // if this hidden item is on the page,
                    console.log($(this).parent().parent().parent().prop('id'));
                    if ($(this).parent().parent().parent().prop('id') == items['hidden'][i]) {
                        if (window.location.pathname.indexOf('/comments/') > -1) {
                            // show unhide link
                            $('a.vee-hide').text('unhide');
                            console.log('comments page unhide link');
                        }
                        else {
                            // hide the div
                            $(this).parent().parent().parent().first().hide(100);   
                        }
                    }
                });
            }
        }
    });
    // listener for hide links
    $('a.vee-hide').on('click', function() {
        // get the id of the surrounding div
        var linkObj = $(this);
        var divid = linkObj.parent().parent().parent().prop('id');
        console.log('hiding ' + divid);
        // get all hidden ids from storage
        chrome.storage.local.get('hidden', function(items) {
            // if there are already items in storage,
            if (items == null || items == undefined || items['hidden'] == undefined || items['hidden'].length < 1) {
                // first hidden item
                items = [divid];
                // and store back into storage
                chrome.storage.local.set({'hidden': items}, function() {
                    // hide the div
                    if (window.location.pathname.indexOf('/comments/') > -1)
                        // toggle hidden status of the submission but don't hide anyting
                        $('a.vee-hide').text('unhide');
                    else
                        // toggle hidden status and hide the submission
                        linkObj.parent().parent().parent().parent().first().hide(100);
                    console.log('item hidden');
                });
            }
            else {
                if ($(this).text() == 'hide') {
                    // hide
                    // add this id to the array
                    items['hidden'].push(divid);
                }
                else {
                    // unhide
                    
                }
                // and store back into storage
                chrome.storage.local.set({'hidden': items['hidden']}, function() {
                    // hide the div
                    if (window.location.pathname.indexOf('/comments/') > -1)
                        // TODO store
                        $('a.vee-hide').text('unhide');
                    else{
                        // TOOD store
                        linkObj.parent().parent().parent().parent().first().hide(100);
                    }
                    console.log('first item hidden');
                });
            }
        });
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
