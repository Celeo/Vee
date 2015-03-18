/*
Increase the width of the overlying conatiner div to 100% of its parent
*/
$('div#container').addClass('max-width');

/*
Increase the width of the comment divs to 100% of their parents
*/
$('div.md').addClass('max-width');

/*
Handle navigating submissions with clicking and the arrow keys.
*/
$('div.submission').on('click', function() {
    if (window.location.pathname == '/' && $('div.submission').index(this) == 0) {
        // clicked on the feature sub header on index page
        return false;
    }
    $('div.submission').each(function() {
        $(this).removeClass('highlighted');
    });
    $(this).addClass('highlighted');
});
$(document).keypress(function(e) {
    switch (e.keyCode) {
        case 113:
            // q - move up
            $('div.submission').each(function(index) {
                if ($(this).hasClass('highlighted')) {
                    if (window.location.pathname !== '/' && index > 1) {
                        $(this).removeClass('highlighted');
                        $('div.submission').eq(index - 1).addClass('highlighted');
                        return false;
                    }
                }
            });
            break;
        case 97:
            // a - move down
            var found = false;
            $('div.submission').each(function(index) {
                if ($(this).hasClass('highlighted')) {
                    $(this).removeClass('highlighted');
                    found = true;
                    $('div.submission').eq(index + 1).addClass('highlighted');
                    return false;
                }
            });
            if (!found) {
                $('div.submission').eq(window.location.pathname == '/' ? 1 : 0).addClass('highlighted');
            }
            break;
        case 119:
            // w - open link

            break;
        case 115:
            // s - save

            break;
        case 99:
            // c - open comments

            break;
        case 101:
            // e - vote up

            break;
        case 100:
            // d - vote down

            break;
    }
});
