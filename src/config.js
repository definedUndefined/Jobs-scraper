const config = {
  // ...
  // The default search parameters
  defaultWebsite: "https://www.monster.fr",
  defaultSearch: {
    query: "alternance developpeur",
    location: "Paris, Île-de-France",
    querySelector: 'input[type="search"][name="q"]',
    locationSelector: 'input[type="search"][name="where"]',
  },
  defaultCookieMessageSelector: {
    acceptAll: 'button[id="onetrust-accept-btn-handler"]',
    rejectAll: 'button[id="onetrust-reject-all-handler"]',
  },
  // ...
  // The default scrap selectors
  dropdownSelector: 'ul[data-testid="datalist"]',
  submitSelector: 'button[aria-label="Rechercher"]',
  cardSelector: '[data-testid="svx_jobCard"]',
  titleSelector: '[data-testid="svx_jobCard-title"]',
  companySelector: '[data-testid="svx_jobCard-company"]',
  locationSelector: '[data-testid="svx_jobCard-location"]',
  salarySelector: '[data-testid="svx_jobCard-details"]',
  // ...
  // The default scroll parameters
  // infiniteScrollContainer: ".infinite-scroll-component__outerdiv",
  scrollStep: 100,
  scrollDelay: 1000,
};

module.exports = config;
