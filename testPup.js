const puppeteer = require('puppeteer');

async function takeScreenshot() {
  // Launch a headless Chrome browser
  const browser = await puppeteer.launch({ headless: true });

  // Create a new page in the browser
  const page = await browser.newPage();

  // Navigate to a webpage
  await page.goto('https://jurisprudencia.stf.jus.br/pages/search?base=acordaos&pesquisa_inteiro_teor=true&sinonimo=true&plural=false&radicais=true&buscaExata=false&page=1&pageSize=10&queryString=recurso&sort=_score&sortBy=desc&isAdvanced=true&julgamento_data=01012000-01012021');

  // Wait for the page to load
  await page.waitForSelector('body');

  // Take a screenshot of the page
  const screenshot = await page.screenshot();

  // Save the screenshot to a file
  require('fs').writeFileSync('screenshotPup.png', screenshot);

  // Close the browser
  await browser.close();
}

takeScreenshot();
