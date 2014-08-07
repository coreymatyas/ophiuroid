# Ophiuroid
Ophiuroid is a node.js application designed for quick web scraping / ripping 
for a variety of media sites. Built with archivists and data hoarders in mind, 
Ophiuroid is intended to be used from a cronjob or otherwise run periodically 
to keep a local copy of a given site consistently updated with new content.
Even then, it's still suitable for one-off downloads.

Ophiuroid tries (as much as a psuedo-monolithic client application can) to fit 
the Unix philosophy to "do one thing and do it well." Ophiuroid is an effective 
tool for simply ripping web media. All application output will be able to 
represented in the filesystem in their original formats without lock-in from a 
proprietary database that would limit compatibility with other tools. 

**Warning**: This software should be considered alpha status for now. If it eats 
your data and ignites your storage cluster (both unlikely, mind you), you've 
been warned. There may be bugs.

## Installation / Use
1. `npm install`
2. `cp config.js.sample config.js`
3. Modify config.js, particularly sites.
4. `node app.js`

## Supported Media Sources
 - Blogger (aka Blogspot): download all images from posts.
 - imgur: download individual images, albums, and the gallery.

## Adding a Ripper
1. Create a new file in rippers/ named as the lowercase of its stylized name 
without spaces. Use hyphens to designate sub-functionality (different path 
requirements) for a given site. ex: `rippers/rippername.js`
2. Add an object to the config for it under config.rip named the same as the 
filename, substituting '.' for '-' (both to create a hierarchy and because '-' 
is an invalid character) if you need config settings. ex: `config.rip.rippername`
3. Add module imports. Ophiuroid exposes 3 things that a ripper will be use:
    1. `../common`: contains common functionality for consistency between 
       rippers. See section below for method listing.
    2. `../log`: common logger using winston. 
    3. `../config`.rip.rippername: get the config for the specific ripper 
       module easily accessible.
4. Set your `module.exports`:
    1. `name`: stylized, human-readable name for the ripper. ex: 'Blogger', 
        'Imgur Gallery', etc.
    2. `url`: regular expression that matches URLs the ripper is capable of 
       ripping. Note: also has to match the protocol. See `blogger.js` for 
       reference.
    3. `authority`: describes how "specific" the `url` regex is to the given 
       ripping method. 0 -> internet (matches any site), 1 -> domain (matches 
       example.com/*), 2+ -> subsections (matches example.com/images/*). Used 
       for determining the most appropriate ripper for a given URL. In the 
       event of multiple rippers of the same highest authority matching the 
       same URL regex, behavior is undefined.
    4. `rip`: function pointer to a function that accepts a site object as 
       the only parameter and performs the ripping.

## common.js Functionality
`common.js` contains the following functions for rippers to use:
 - `downloadFileTo(site, siteUrl, filename)`: download and save `siteUrl` 
   in the save context of `site` to the given `filename`.
 - `downloadFile(site, siteUrl)`: short form of `downloadFileTo` without a 
   custom filename.
 - `ripSite(site)`: perform a rip on the given site object.
 - `ripURL(site, url)`: rip `url` in the save context of `site` using the 
   appropriate ripper from `ripSite`.

## Contributing
I'm not actively seeking contributions since a lot of the core isn't finished 
yet, but if you particularly want to help, I've got a TODO list in the comments 
near the top of `app.js`. Once I've gotten the program and APIs stable enough to 
be considered beta, I'll move them to GitHub Issues.

Things that can be contributed include:
 - Bug fixes.
 - Rippers for other sites.
 - Performance improvements.
 - Code cleanliness (I'm new to node, sorry!) improvements.
 - Anything else that might be useful.

Just fork, modify, commit, push, and submit a pull request. Please be detailed 
in explaining your changes. Thanks!

## Name Etymology
An ophiuroid is a member of the Ophiuroidea class of Echinodermata, commonly 
known as a brittle star. They're related to starfish, and live on the ocean 
floor where they _crawl_ along in search of food. Get it? Crawling? C'mon, 
it's funny. They're also spiny which, in some regards, could make that crawling 
more like scraping. And, food could be an analogy for media? Whether the 
metaphor is decent or not, the program is still called Ophiuroid. Hope it's 
useful!

![Ophiuroid](http://i.imgur.com/q5k1RnT.jpg "The Glorious Ophiuroid")