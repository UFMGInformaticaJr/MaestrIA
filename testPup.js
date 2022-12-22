const puppeteer = require('puppeteer');

async function takeScreenshot() {
  // Launch a headless Chrome browser
  const browser = await puppeteer.launch({ headless: false });
  

  // Create a new page in the browser
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36');
  


  // Navigate to a webpage
  await page.goto('https://jurisprudencia.stf.jus.br/pages/search');

  // Wait for the page to load
  await page.waitForSelector('body');

  await page.goto('https://portal.stf.jus.br/processos/detalhe.asp?incidente=1623254')

  async function getElementByXpath(xpath, page) {
    try {
        console.log(`xpath${xpath}`)
        return await page.waitForSelector(`xpath${xpath}`, { visible: true }, 1000);
    }
    catch (err) {
        console.error("Erro ao encontrar elemento pelo xpath: " + xpath)
        throw err;
    }
}

  var element = await getElementByXpath('/html/body/div[1]/div[2]/section/div/div/div/div/div/div/div[1]/div[1]/div[2]', page);
  element = await page.evaluate(element => element.textContent, element);
  console.log(element)

  


  await page.screenshot({fullPage: true, path: 'screenshotPup.png'});


  // Take a screenshot of the page
  const screenshot = await page.screenshot();

  // Save the screenshot to a file
  require('fs').writeFileSync('screenshotPup.png', screenshot);

  // Close the browser
  await browser.close();
}

module.exports = takeScreenshot;
