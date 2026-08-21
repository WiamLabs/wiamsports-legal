WiamSports legal pages. Same design as the original HTML. Hosted on GitHub Pages.

After the first push, add this DNS record in Cloudflare for wiamlabs.com:

Type: CNAME
Name: sports
Target: wiamlabs.github.io
Proxy: DNS only (grey cloud)

Then wait for https://sports.wiamlabs.com/legal
