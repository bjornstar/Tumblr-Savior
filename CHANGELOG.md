# Tumblr Savior Changelog

## v1.1.0 - 2020-04-10
 * Actually fix the width for the warning icon
 * Add a trim to context menu selection because both Firefox and Opera like to include the trailing space
 * Remove some obsolete code
 * Fix an issue where the search page would not be filtered initially
 * Update the README and the about tab to include a solicitation for sponsorship

## v1.0.1 - 2020-04-09
 * Use width instead of min-width for warning icon (flexbug in firefox)
 * Remove a console.log

## v1.0.0 - 2020-04-05
 * Updated to work with the latest version of tumblr
 * New default blacklist entries: coronavirus and trump
 * New description in the manifest
 * New option to remove reblog headers (enabled by default)
 * Removed Safari support until I can find an Apple device
 * Removed some obsolete options
 * Removed support for filtering the inbox
 * Removed showing whitelist matches for now
 * Removed showing notices

## v0.5.7 - 2018-05-22
 * Remove vendor prefixed rules for wireUpNodes (fixes #57)
 * Make `disable on inbox` work on blog specific inboxes (fixes #56)
 * When resetting a post, just remove the display style instead of setting it to `list-item`

## v0.5.6 - 2018-03-30
 * Use old school iterator for old school browsers (fixes #55)

## v0.5.5 - 2018-03-29
 * Directly extract the text ourselves instead of stripping out html tags (fixes #54)
 * Add a CSS rule for li elements to remove list-style as it was missing on search result pages

## v0.5.4 - 2017-07-28
 * Block a new type of ad: `dfp-ad-container` (fixes #50)
 * Hide notifications when recommended or sponsored posts are hidden (fixes #41)
 * Fix header markdown in the changelog
 * Fix header markdown in the readme
 * Got a new cert for Safari, the previous would expire next month
 * Updated build script

## v0.5.3 - 2017-03-07
 * Shorten description in info.plist
 * Improve localStorage handling in options (No more alert on empty settings in Safari)

## v0.5.2 - 2017-03-06
 * Use xar-mackyle on os x
 * Include icon & screenshot for safari extension gallery
 * Remove references to deprecated chrome.tabs.sendRequest
 * Copy description into info.plist

## v0.5.1 - 2017-03-02
 * Avoid tumblr opening a blog in a new tab when clicking on a blacklist notification (Thanks @EmandM!)
 * Remove several unused variables in the options page
 * Simplify browser and feature detection logic
 * Hide yahoo ads by default
 * Remove link & italics from blacklist notification

## v0.5.0 - 2016-08-29
 * Firefox version is now a WebExtension, removed old code.
 * Cleaned up multiple spaces to make it more natural to block bits that could have multiple spaces (soandso reblogged whositwhatsit)

## v0.4.28 - 2016-07-06
 * Include the new sidebar add when blocking Yahoo! ads (fixes #42)
 * Add a link to https://paypal.me/bjornstar for people to show their appreciation (fixes #43)

## v0.4.27 - 2016-04-04
 * If the filter is triggered but the content is not loaded, run it again
 * Remove `applications` entry from manifest

## v0.4.26 - 2016-03-13
 * Add `applications` entry to manifest to work around [a bug in AMO validator](https://github.com/mozilla/amo-validator/issues/405)

## v0.4.25 - 2016-03-13
 * Block a new type of ad: `standalone-ad-container` (fixes #38)
 * Blacklist notices now get inserted at the same level as the post_container (fixes #7)
 * Start Tumblr Savior earlier, allows style based hiding to run before all content is loaded

## v0.4.24 - 2016-01-21
 * Added an option in the Tumblr Behavior section to remove the t.umblr.com redirect (fixes #36)

## v0.4.23 - 2015-12-10
 * Fixed an issue where you were unable to block HTML Encoded entities: &, <, and > (fixes #31)
 * Block a new type of ad: `video-ad-container` (fixes #34)

## v0.4.22
 * Added options to ignore header, content, and/or tags of posts.
 * Added an option to hide yahoo advertisements (fixes #28)
 * We now use the built-in tumblr icons for whitelist / blacklist notices, removed the base64 encoded icon from the userscript.
 * Fixed an issue where styles were being duplicated on saves.
 * Fixed an issue where some sponsored posts were getting through (fixes #27)
 * Multiple asterisks in a blacklist / whitelist entry no longer cause an error (fixes #29)

## v0.4.21
 * Added an option to hide sponsored notifications (ie. "Embrace your uncomfort zone")
 * Re-organized the options to distinguish between controlling Tumblr Savior's behavior and Tumblr's behavior.

## v0.4.20
 * Fixed Safari's options popup that I broke in v0.4.19, I think I also broke live updates of the popups. (fixes #19)
 * Added an option to hide tumblr's trending badges. (fixes #20)
 * Added an option to disable tumblr savior on your inbox. (fixes #16)
 * Removed the alert saying your settings are corrupt the first time you install in Safari. (fixes #21)

## v0.4.19
 * I broke filters with the asterisk change in v0.4.18, sorry!
 * Remove a data: uri from the options page since a Mozilla Add-On Editor was objecting to it

## v0.4.18
 * Asterisk should match any non-space character (fixes #14)
 * Tags should be aligned properly when hiding source (fixes #15)
 * Reorganized files to avoid duplicates in the Mozilla Add-On SDK (fixes #17)
 * Moved options css into separate file and tweaked to match tumblr background color
 * Made the save/load tab pretty print json

## v0.4.17
 * Added an option to hide the radar
 * Added an option to hide the recommended blogs section in the sidebar
 * Made the hide the recommended post section more explicit, it hides the "Here's a blog" type posts
 * The hide source option now hides the source at the top and the bottom of the post

## v0.4.16
 * Added an option to hide the "Some More Blogs" section that can appear on the dashboard.
 * Made the "Hide Recommended Posts" also hide the "Recommended Blogs" section on the sidebar. I might make that a separate option in the future.
 * Removed obsolete options regarding pinned posts.

## v0.4.15
 * Made the hide sponsored option more robust.

## v0.4.14
 * The hide sponsored option now hides both sponsored posts and sponsored links.

## v0.4.13
 * Made tumblr savior run correctly on /search pages
 * Added a space between tags
 * Better looking Safari icons from @crowsonkb
 * Smart quotes on Safari from @crowsonkb
 * Fixed context menu disabling on Safari from @crowsonkb

## v0.4.12
 * Toolbar button for Firefox, supports v30+
 * Added option to hide "recommended" posts @zero-jt
 * Added option to hide "sponsored" posts
 * Reorganized files, now the extension lives in src
 * Filled in README
 * Fixed the about tab to open links in a new window
 * Fixed a bug where blacklist/whitelist entries could not contain +

## v0.4.11
 * Only search html in post_content.

## v0.4.10
 * Added support for the ssl version of the dashboard.

## v0.4.9
 * Removed old Opera code, filters are now much faster, and fixed a bug caused by popovers interfering with normal operation.

## v0.4.8
 * manifest.json file didn't get updated properly.

## v0.4.7
 * Works for both versions of the dashboard now. Added context menu item for Opera and fixed context menu for Safari.

## v0.4.6
 * Updated to work with the new Tumblr dashboard. A few bug fixes as well.

## v0.4.5
 * Mostly a fix for Firefox.

## v0.4.4
 * Updated to match Tumblr's latest style.

## v0.4.3
 * Removed innerHTML modifications and DOMNodeInserted for incredible performance gains.

## v0.4.2
 * Fixed an issue with match whole words introduced in previous version.

## v0.4.1
 * Fixed an issue with regex characters.

## v0.4
 * Added Firefox support, also fixed some issues with the options page.
