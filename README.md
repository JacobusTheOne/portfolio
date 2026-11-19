# Portfolio

A one-page portfolio that shows my websites as cards with links. Plain HTML, CSS and JavaScript:
no framework, no build step, nothing to install.

## Add or change a website

Edit **`sites.js`**. That's the only file you need to touch.

```js
{
  title: "My Next Site",
  url: "https://example.com",
  description: "What it does in one sentence.",
  tags: ["HTML", "CSS"],
  code: "https://github.com/JacobusTheOne/repo-name",   // optional
  image: "images/my-next-site.png",                      // optional
  featured: true,                                        // optional, shows first
},
```

Your name, intro and profile links are in `PROFILE` at the top of the same file.

### Screenshots (optional)

Put a screenshot in an `images/` folder (16:9 works best, e.g. 1280×720) and set `image` to its
path. Without one, the card shows a colored placeholder with the site's initials.

## Preview

Double-click `index.html`. That works because the data is a `.js` file, not `.json`.

## Files

| File | Purpose |
|---|---|
| `sites.js` | Your profile and list of websites |
| `index.html` | Page structure |
| `styles.css` | Look and feel (light/dark follows your system setting) |
| `script.js` | Builds the cards and tag filters from `sites.js` |
