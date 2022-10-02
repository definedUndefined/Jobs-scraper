const puppeteer = require("puppeteer");
const defaultConfig = require("./config");
const moment = require("moment");

class Monster {
  ceilElement = 0;
  constructor(config) {
    this.browser = null;
    this.page = null;
    this.config = config || defaultConfig;
    this.outFile = `${moment().format("YYYY-MM-DD-HH-mm-ss")}.json`;
  }

  /**
   * PHP-like sleep function
   * @param {number} ms : milliseconds
   * @returns Promise
   */
  static sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /**
   * Get browser instance
   * @returns {Promise<Browser>} puppeteer browser instance
   * @private
   */
  async #getBrowser() {
    return await puppeteer.launch({
      headless: false,
      // devtools: true,
      args: [
        "--no-sandbox",
        "--disable-notifications",
        "--disable-setuid-sandbox",
      ],
    });
  }

  /**
   * Get page instance
   * @returns {Promise<Page>} puppeteer page instance
   * @private
   */
  async #getPage() {
    return await this.browser.newPage();
  }

  /**
   * Clear Geolocation Alert
   */
  #clearGeolocationAlert() {
    const context = this.browser.defaultBrowserContext();
    context.overridePermissions(this.config.defaultWebsite, [
      "geolocation",
      "notifications",
    ]);
  }

  /**
   * Navigate to the page specified in config
   * @private
   */
  async #navigateToPage() {
    return await this.page.goto(this.config.defaultWebsite);
  }

  /**
   * Clear cookies message from Monster.fr
   * @private
   */
  async #clearCookiesMessage() {
    await this.page.waitForSelector(
      this.config.defaultCookieMessageSelector.rejectAll
    );
    await this.page.click(this.config.defaultCookieMessageSelector.rejectAll, {
      delay: 1000,
    });
  }

  /**
   * Search for the query specified in config
   * @param {string} defaultSearch.query query to search (Check Config)
   * @param {string} defaultSearch.location location to search (Check Config)
   * @private
   */
  async #search() {
    await this.page.type(
      this.config.defaultSearch.querySelector,
      this.config.defaultSearch.query,
      {
        delay: 100,
      }
    );
    await this.page.type(
      this.config.defaultSearch.locationSelector,
      this.config.defaultSearch.location,
      { delay: 100 }
    );
  }

  /**
   * Select first location in location dropdown, based on location specified in config
   * @private
   */
  async #selectFirstItemInDropdown() {
    await this.page.waitForSelector(this.config.dropdownSelector);

    await Monster.sleep(1000);

    const dropdownHandle = await this.page.$(this.config.dropdownSelector);

    await this.page.evaluate((dropdown) => {
      dropdown.querySelector("li:first-of-type").click();
    }, dropdownHandle);

    await dropdownHandle.dispose();
  }

  /**
   * Submit search
   * @private
   */
  async #submitSearch() {
    await this.page.waitForSelector(this.config.submitSelector);
    await this.page.click(this.config.submitSelector, { delay: 1000 });
  }

  /**
   * Scrap data from the page 
   * 
   * The following selectors are used to scrap data (`Config`):
   * - `cardSelector`
   * - `titleSelector`
   * - `companySelector`
   * - `locationSelector`
   * - `salarySelector`
   */
  async scrap() {
    const visibleElement = await this.page.$$eval(this.config.cardSelector, cards => cards.length);

    if (visibleElement > this.ceilElement) {
      const cards = await this.page.evaluate((ceil, config) => {
        const cardsArray = Array.from(document.querySelectorAll(config.cardSelector));
        return cardsArray.slice(ceil).map(card => {
          const title = card.querySelector(config.titleSelector).innerText;
          const link = card.href
            ? card.href
            : card.querySelector(config.titleSelector).href;
          const company = card.querySelector(config.companySelector).innerText;
          const location = card.querySelector(config.locationSelector).innerText;
          const salary = card.querySelector(config.salarySelector).innerText;
          return { title, link, company, location, salary };
        });
      }, this.ceilElement, this.config);

      // console.log(cards);
      this.#saveToFile(cards);

      this.ceilElement = visibleElement;
    }
  }

  /**
   * Save data to file
   * 
   * This function append data to a JSON file created in `~\data` folder
   * @param {Iterable} data data to save
   * @private
   */
  #saveToFile = (data) => {
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(path.dirname(__dirname), "data", this.outFile);

    fs.readFile(filePath, (err, content) => {
      const fileContent = err ? [] : JSON.parse(content);
      const results = [...fileContent, ...data];
      fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
    });
  };

  /**
   * function that scrolls one step down
   * 
   * You can update the scroll steep `scrollStep` in the `Config` file -> default 100
   * 
   * Be aware that a scroll step too high can cause loss of information because the bot reaches the end of the page before the data is loaded
   */
  async scroll() {
    const { scrollPosition, scrollMax, windowHeight } =
      await this.page.evaluate(() => {
        const scrollMax = document.documentElement.scrollHeight;
        const scrollPosition = document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;

        return { scrollPosition, scrollMax, windowHeight };
      });

    const scrollTaget = scrollPosition + this.config.scrollStep;

    await this.page.evaluate((scrollTaget) => {
      window.scrollTo({ top: scrollTaget, behavior: "smooth" });
    }, scrollTaget);

    return Math.ceil(scrollTaget + windowHeight) < scrollMax
      ? Promise.reject()
      : Promise.resolve();
  }

  /**
   * Resolve infinite scroll while scraping
   * 
   * You can update delay between scrolls `scrollDelay` (in milliseconds) -> default 1000 (`Config`)
   * 
   * Be aware that a delay too short can cause loss of information because the bot reaches the end of the page before the data is loaded
   */
  async scrapWhileScrolling() {
    // scrap and save to file
    await this.scrap();

    // scroll
    await this.scroll().catch(async () => {
      await Monster.sleep(this.config.scrollDelay);
      await this.scrapWhileScrolling();
    });
  }

  /**
   * Start the bot
   */
  async run() {
    this.browser = await this.#getBrowser();
    this.page = await this.#getPage();
    this.#clearGeolocationAlert();
    await this.#navigateToPage();
    await this.#clearCookiesMessage();
    await this.#search();
    await this.#selectFirstItemInDropdown();
    await this.#submitSearch();
    await this.page.waitForNavigation();
    await this.scrapWhileScrolling();
    await this.browser.close();
  }
}

module.exports = Monster;