#Tumblr Savior Changelog

##v0.4.22
 * Added options to ignore header, content, and/or tags of posts

##v0.4.21
 * Added an option to hide sponsored notifications (ie. "Embrace your uncomfort zone")
 * Re-organized the options to distinguish between controlling Tumblr Savior's behavior and Tumblr's behavior.

##v0.4.20
 * Fixed Safari's options popup that I broke in v0.4.19, I think I also broke live updates of the popups. (fixes #19)
 * Added an option to hide tumblr's trending badges. (fixes #20)
 * Added an option to disable tumblr savior on your inbox. (fixes #16)
 * Removed the alert saying your settings are corrupt the first time you install in Safari. (fixes #21)

##v0.4.19
 * I broke filters with the asterisk change in v0.4.18, sorry!
 * Remove a data: uri from the options page since a Mozilla Add-On Editor was objecting to it

##v0.4.18
 * Asterisk should match any non-space character (fixes #14)
 * Tags should be aligned properly when hiding source (fixes #15)
 * Reorganized files to avoid duplicates in the Mozilla Add-On SDK (fixes #17)
 * Moved options css into separate file and tweaked to match tumblr background color
 * Made the save/load tab pretty print json

##v0.4.17
 * Added an option to hide the radar
 * Added an option to hide the recommended blogs section in the sidebar
 * Made the hide the recommended post section more explicit, it hides the "Here's a blog" type posts
 * The hide source option now hides the source at the top and the bottom of the post

##v0.4.16
 * Added an option to hide the "Some More Blogs" section that can appear on the dashboard.
 * Made the "Hide Recommended Posts" also hide the "Recommended Blogs" section on the sidebar. I might make that a separate option in the future.
 * Removed obsolete options regarding pinned posts.

##v0.4.15
 * Made the hide sponsored option more robust.

##v0.4.14
 * The hide sponsored option now hides both sponsored posts and sponsored links.

##v0.4.13
 * Made tumblr savior run correctly on /search pages
 * Added a space between tags
 * Better looking Safari icons from @crowsonkb
 * Smart quotes on Safari from @crowsonkb
 * Fixed context menu disabling on Safari from @crowsonkb

##v0.4.12
 * Toolbar button for Firefox, supports v30+
 * Added option to hide "recommended" posts @zero-jt
 * Added option to hide "sponsored" posts
 * Reorganized files, now the extension lives in src
 * Filled in README
 * Fixed the about tab to open links in a new window
 * Fixed a bug where blacklist/whitelist entries could not contain +

##v0.4.11
 * Only search html in post_content.

##v0.4.10
 * Added support for the ssl version of the dashboard.

##v0.4.9
 * Removed old Opera code, filters are now much faster, and fixed a bug caused by popovers interfering with normal operation.

##v0.4.8
 * manifest.json file didn't get updated properly.

##v0.4.7
 * Works for both versions of the dashboard now. Added context menu item for Opera and fixed context menu for Safari.

##v0.4.6
 * Updated to work with the new Tumblr dashboard. A few bug fixes as well.

##v0.4.5
 * Mostly a fix for Firefox.

##v0.4.4
 * Updated to match Tumblr's latest style.

##v0.4.3
 * Removed innerHTML modifications and DOMNodeInserted for incredible performance gains.

##v0.4.2
 * Fixed an issue with match whole words introduced in previous version.

##v0.4.1
 * Fixed an issue with regex characters.

##v0.4
 * Added Firefox support, also fixed some issues with the options page.
