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