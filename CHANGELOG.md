# Tumblr Savior Changelog

## v2.1.1 / 2025-01-19
* Do not hide buttons in `moreContent` asides (Fixes #95)

## v2.1.0 / 2024-12-04
* Handle content inside of P tags as text (Fixes #94)
* Remove a console.log

## v2.0.1 / 2024-11-12
* Update Firefox AddOn specific id value

## v2.0.0 / 2024-11-12
* There is a one-time manual step you need to take in Tumblr Savior's options to read your localStorage settings and load it into browser extension storage.
  Go to the Save / Load tab and press the "Read from localStorage" button then you can press the "Load" button to have it applied. It will save it to your
  browser extension storage and work as normal from there on out.
* Switched to Manifest v3
* Tweaked sidebar blocking methodology
* [devDependencies] Updated `eslint` & `addons-linter` to latest versions
* [Workflows] Use node v22 for testing

## v1.16.0 / 2024-05-17
* Updated hiding sponsored posts, now just does `moatContainer`
* Removed the hydration canary in favor of assuming hydration has succeeded the first time the base container is updated
* Apply default values when individual options have not been set yet
* Added a new option to block posts that are `timelineObject`s
* Added a new option to block buttons in the sidebar (Go ad-free today)
* Reorganized the options slightly to separate sidebar from posts
* Updates `eslint` & `addons-linter` to latest version
* Update more workflows to use node v20

## v1.15.0 / 2023-08-26
* Update for the latest version of the desktop
* New `CSS_CLASS_MAP` -- https://assets.tumblr.com/pop/cssmap-232fd5ad.json
* Replaced `t.umblr.com` redirect removal with `href.li`
* Updated workflows to run on node v20
* Updated `eslint` & `addons-linter` to latest version

## v1.14.0 / 2023-01-23
* [`main.js`] Continue using `chrome` instead of `browser` (Fixes #85)
* [`script.js`] Do not hide tags when a post is whitelisted (Fixes #86)
* [`script.js`] Refactor show/hide tags code
* [`script.js`] Skip blacklisting on drafts pages (Fixes #82)

## v1.13.0 / 2022-12-13
* [`script.js`] Use more specific selectors for hiding sidebar items (Fixes #83)
* [`options.js`] Replace deprecated `extension.getURL` with `runtime.getURL`
* [`package.json`] Update devDependency `addons-linter`
* [`package.json`] Update devDependency `eslint`

## v1.12.1 / 2021-11-10
* [`CI`] Only test on node v16
* [`CI`] Also run `addons-linter` when testing
* [`package.json`] Move `eslint` into it's own command
* [`package.json`] Add `addons-linter`

## v1.12.0 / 2021-11-10
* Update `CSS_CLASS_MAP` -- https://assets.tumblr.com/pop/cssmap-84fedc5a.json
* [`.gitignore`] Add `package-lock.json`
* [`options.html`] Remove periods from the end of labels
* [`options.html`] Drop a the
* [`package.json`] Update `eslint` from `7.32.0` to `8.2.0`

## v1.11.0 / 2021-08-20
 * Include text extracted from post bodies so they can be filtered even if they've been heavily styled

## v1.10.0 / 2021-08-18
 * Update `CSS_CLASS_MAP` -- https://assets.tumblr.com/pop/cssmap-6fca4540.json (Fixes #78)
 * Use `textContent` instead of `innerText` for better performance
 * [`package.json`] Update devDependency `eslint` from `v7.10.0` to `v7.32.0`
 * [`CHANGELOG.md`] Use a slash to separate the version number from the year
 * [`LICENSE`] Update most recent year to `2021`

## v1.9.0 / 2021-04-20
 * Updated `CSS_CLASS_MAP` to match tumblr's new one (https://assets.tumblr.com/pop/cssmap-e28281a0.json)
 * tumblr removed the numbered css variables so we update ours to match

## v1.8.0 / 2021-01-20
 * Changed the wording from `notification` to `content warning` since tumblr doesn't use notifications on the dashboard anymore
 * Fixed a bug where whitelisted posts would be hidden when content warnings are disabled
 * Restored the option to hide recommended posts (Fixes #66) (Fixes #64)
 * Found another source attribution block to hide

## v1.7.0 / 2020-12-28
 * Make "Ignore filtered content" an option (Fixes #76)
 * Add an option to hide filtered content

## v1.6.3 / 2020-12-27
 * Properly apply default settings when there weren't any saved settings
 * Ignore `filteredScreen` content in the body, this avoids filtering out Tumblr's filter messages which do not have footers

## v1.6.2 / 2020-10-10
 * [`manifest.json`] Forgot to update the version

## v1.6.1 / 2020-10-10
 * Move icon and screenshot from root to `media` directory
 * [`.npmignore`] Ignore `.github` and `media` directories for npm package

## v1.6.0 / 2020-10-10
 * Filter out the `footerWrapper` instead of the `footer` for the post body
 * Use the `tags` class instead of the `footer` for the post tags

## v1.5.1 / 2020-10-08
 * [`.github/workflows`] Don't use $default-branch, just use your branch name
 * [`PRIVACY.md`] Move to root of the project

## v1.5.0 / 2020-10-08
 * Adapted to a tumblr update that put the footer in a container (Fixes #73)
 * Use a `CSS_CLASS_MAP` so that we can refer to unobfuscated classNames
 * [`PRIVACY.md`] Added a privacy policy because the Microsoft Edge Add-on site requests one

## v1.4.0 / 2020-10-01
 * Use `aria-label` for header contents (Thanks @mtae!)
 * Add github workflow for CI
 * Remove deprecated safari extension build scripts
 * [`package.json`] Add tumblr to keywords
 * [`package.json`] Update devDependency `eslint` from `v7.4.0` to `v7.10.0`
 * [`package.json`] Rename `lint` script to `test`
 * [`LICENSE`] Make the copyright year a range of years

## v1.3.0 / 2020-07-11
 * Looks like the previous method of hiding sponsored posts didn't last, here's a new one
 * Improve behavior when overlapping with tumblr's own content filter
 * Use more es6 code

## v1.2.0 / 2020-07-05
 * Try a new way to hide sponsored posts (fixes #68)
 * Do not extract text from the `ts-notice`
 * All logic regarding the context menu is now in `main.js`, this fixes a bug where enabling the context menu would cause it to stop working
 * Add a missing article in options
 * Use a css variable for the warning background color
 * Drop the uppercase w from the content warning
 * Use more es6 code
 * Add an extra line break before last line in the about tab
 * Add Edge as a potential supported browser
 * Add a `package.json`
 * Start using eslint

## v1.1.0 / 2020-04-10
 * Actually fix the width for the warning icon
 * Add a trim to context menu selection because both Firefox and Opera like to include the trailing space
 * Remove some obsolete code
 * Fix an issue where the search page would not be filtered initially
 * Update the README and the about tab to include a solicitation for sponsorship

## v1.0.1 / 2020-04-09
 * Use width instead of min-width for warning icon (flexbug in firefox)
 * Remove a console.log

## v1.0.0 / 2020-04-05
 * Updated to work with the latest version of tumblr
 * New default blacklist entries: coronavirus and trump
 * New description in the manifest
 * New option to remove reblog headers (enabled by default)
 * Removed Safari support until I can find an Apple device
 * Removed some obsolete options
 * Removed support for filtering the inbox
 * Removed showing whitelist matches for now
 * Removed showing notices

## v0.5.7 / 2018-05-22
 * Remove vendor prefixed rules for wireUpNodes (fixes #57)
 * Make `disable on inbox` work on blog specific inboxes (fixes #56)
 * When resetting a post, just remove the display style instead of setting it to `list-item`

## v0.5.6 / 2018-03-30
 * Use old school iterator for old school browsers (fixes #55)

## v0.5.5 / 2018-03-29
 * Directly extract the text ourselves instead of stripping out html tags (fixes #54)
 * Add a CSS rule for li elements to remove list-style as it was missing on search result pages

## v0.5.4 / 2017-07-28
 * Block a new type of ad: `dfp-ad-container` (fixes #50)
 * Hide notifications when recommended or sponsored posts are hidden (fixes #41)
 * Fix header markdown in the changelog
 * Fix header markdown in the readme
 * Got a new cert for Safari, the previous would expire next month
 * Updated build script

## v0.5.3 / 2017-03-07
 * Shorten description in info.plist
 * Improve localStorage handling in options (No more alert on empty settings in Safari)

## v0.5.2 / 2017-03-06
 * Use xar-mackyle on os x
 * Include icon & screenshot for safari extension gallery
 * Remove references to deprecated chrome.tabs.sendRequest
 * Copy description into info.plist

## v0.5.1 / 2017-03-02
 * Avoid tumblr opening a blog in a new tab when clicking on a blacklist notification (Thanks @EmandM!)
 * Remove several unused variables in the options page
 * Simplify browser and feature detection logic
 * Hide yahoo ads by default
 * Remove link & italics from blacklist notification

## v0.5.0 / 2016-08-29
 * Firefox version is now a WebExtension, removed old code.
 * Cleaned up multiple spaces to make it more natural to block bits that could have multiple spaces (soandso reblogged whositwhatsit)

## v0.4.28 / 2016-07-06
 * Include the new sidebar add when blocking Yahoo! ads (fixes #42)
 * Add a link to https://paypal.me/bjornstar for people to show their appreciation (fixes #43)

## v0.4.27 / 2016-04-04
 * If the filter is triggered but the content is not loaded, run it again
 * Remove `applications` entry from manifest

## v0.4.26 / 2016-03-13
 * Add `applications` entry to manifest to work around [a bug in AMO validator](https://github.com/mozilla/amo-validator/issues/405)

## v0.4.25 / 2016-03-13
 * Block a new type of ad: `standalone-ad-container` (fixes #38)
 * Blacklist notices now get inserted at the same level as the post_container (fixes #7)
 * Start Tumblr Savior earlier, allows style based hiding to run before all content is loaded

## v0.4.24 / 2016-01-21
 * Added an option in the Tumblr Behavior section to remove the t.umblr.com redirect (fixes #36)

## v0.4.23 / 2015-12-10
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
