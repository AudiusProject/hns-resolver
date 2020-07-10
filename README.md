# A simple HNS resolver for Audius

We were fortunate to win the auction for the ["audius" tld on Handshake name
service](https://hnscan.com/name/audius) in May 2020. But this got us thinking - what
could we use it for? We settled on building a simple resolver to map artist names to their
Audius profiles, and map "audius/" to the Audius app. I (Roneil) thought it would be a
great project for me to work on in our quarterly company hackathon!

Goal: resolve artistname.audius to audius.co/artistname and audius/ to audius.co/feed

The easiest way to achieve this was to run a centralized nameserver and redirect proxy in
one box. I assigned the box IP to the HNS nameserver field, then set up a small DNS server
/ web server combo to do the name resolution and redirecting.

Ended up being a 2-3 hour project to build, debug, test, and ship, though we were blocked
at the end on waiting for the HNS blockchain to confirm the nameserver change.

This simple approach could be used to get anyone up to speed easily with wildcard HNS
resolution.

## Step 0: Server config

On ubuntu 18.04, you have to stop resolved from binding to port 53, freeing it up for us.

Follow these instructions:
https://medium.com/@niktrix/getting-rid-of-systemd-resolved-consuming-port-53-605f0234f32f

(If you do not do this, running the dns server will silently fail to bind the port!)

## Step 1: DNS resolver

This involves writing your own DNS nameserver that resolves any and all requests to the
current local external IP.

I chose to use [native-dns](https://www.npmjs.com/package/native-dns), a teeny DNS server
implementation that seemed to support the functionality we needed here trivially, and also
has an npm package.

This is a hack to implement wildcard DNS - no matter what DNS request is made to this
nameserver, we always return our current public IP as an A record for the name given.

This is implemented in index.js!

## Step 2: soft redirect webserver

Field web requests:
- if request is of form xyz.audius, send user to audius.co/xyz
- if request is of any other form, send user to audius.co/feed

Using soft (302) redirects to give us optionality in future.

And that's it!

## Step 3: Write public IP to Handshake on-chain as ns1

The title explains itself here - write the public IP for this server to a nameserver
field. I used namebase to do this, as the audius TLD is registered there.

## Tying it all together

Install all local dependencies after checking out this repo: `npm install`

Then run the server on the box by doing `sudo node src/index.js` (root privs necessary to
bind ports 53 and 80 without fuss)

## Future work

1. Support running as an actual service on the box instead of doing
   `sudo node src/index.js` and leaving it open in tmux or screen

2. It would be awesome to support different query data / query types here. What if you
   could pay artistname.audius?

3. This should also be decentralized. There is probably a better way to support wildcards
   that does not involve our jank DNS server.
