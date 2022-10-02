# Jobs-scraper

Job scraper is a bot built on top of [Puppeteer](https://github.com/puppeteer/puppeteer) to scrap jobs from different french websites.

### Websites :
- [x] [Monster](https://www.monster.fr/)
- [] [Indeed](https://fr.indeed.com/)
- [] [Linkedin](https://www.linkedin.com/)
- [] [Welcometothejungle](https://www.welcometothejungle.com/fr/jobs)

## Getting started

To use the bot in your project :

```
 $ git clone https://github.com/definedUndefined/Jobs-scraper.git
 $ cd Jobs-scraper
 $ npm i
```

You can update `src/config.js` to provide your own search query and location.

```javascript
const config = {
  // ...
  defaultSearch: {
    query: "alternance developpeur",
    location: "Paris, Île-de-France",
  // ...
}
```
Be aware that the first location matched by the website will be used for the query.

You can run the bot with the following command :

```
npm run start
```

Results are available in `~/data` folder, in a file relative to the runtime.