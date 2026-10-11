# New-tab redirect

Browsers don't let you point the new tab page at a URL, so this five-file
extension does it. It has no permissions and runs nothing but a redirect.

Set the address in `config.js` if your Pages URL differs, then:

- **Chrome / Edge / Brave / Arc:** `chrome://extensions` (or `edge://extensions`),
  turn on Developer mode, **Load unpacked**, choose this folder.
- **Firefox:** `about:debugging#/runtime/this-firefox` > **Load Temporary Add-on**
  loads it until restart. To keep it, sign it as an unlisted add-on at
  addons.mozilla.org (free, no review queue for unlisted), or use an existing
  "custom new tab URL" add-on.
- **Safari:** no extension needed. Settings > General: set **Homepage** to the
  URL and **New tabs open with** to *Homepage*.
- **Phone:** bookmark it, or add it to the home screen.
