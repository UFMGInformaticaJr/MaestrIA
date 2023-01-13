const puppeteer = require('puppeteer-extra') 
const pluginStealth = require('puppeteer-extra-plugin-stealth') 
const {executablePath} = require('puppeteer');
puppeteer.use(pluginStealth())

const sleep = require('util').promisify(setTimeout);

class BasePage {
   
    constructor() {
        this.browser = null;
        this.page = null;
        
    }

    async init() {
        this.browser = await puppeteer.launch({
            executablePath: executablePath(),
            headless: false,
            defaultViewport: null,
            args: [
                '--start-maximized',
                '--ignore-certificate-errors',
                '--allow-running-insecure-content',
                '--disable-extension',
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--proxy-server="direct://"',
                '--proxy-bypass-list=*'

            ],
            ignoreHTTPSErrors: true
        });

        this.page = await this.browser.newPage();
        await this.page.setViewport({
            width: 375,
            height: 667
          });
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36');

    }

    async scrollRow() {
        const element = await this.selectAndWait(this.botaoPesquisar, 2000);
        await this.page.evaluate((element) => {
            element.scrollIntoView();
        }, element);
    }
            
    async goToUrl(theURL) {
        const old = this.page.target();
        this.old_window.push(old);
        await this.page.goto(theURL);
        
    }

    async openUrlAndWaitForPageLoad(url) {
        await this.goToUrl(url);

        await sleep(3000);
    }

    async renderPage() {
        await this.page.waitForSelector('body', { visible: true }, 3000);
    }
  
    async getElementByXpath(xpath, timeout=1000, log=true) {
        try {
            return await this.page.waitForSelector(`xpath${xpath}`, { visible: true }, timeout);
        }
        catch (err) {
            if (log){
                console.error("Erro ao encontrar elemento pelo xpath: " + xpath)
            }    
            throw err;
        }
    }
    async getTextUsingSelector(path) {
        
        let element = await this.getElementByXpath(path);
       
        return await element.evaluate(element => element.textContent, element)
    }
    async getInnerTextUsingSelector(path) {
        const elem = await this.getElementByXpath(path);
        return elem.evaluate(element => element.innerText, elem);
    }
  
    async clickByXpath(xpath) {
        const elem = await this.getElementByXpath(xpath);
        await sleep(1000);
        await elem.click();
    }
    async getLinkByXpath(xpath) {
        const elem = await this.getElementByXpath(xpath);
        return await elem.evaluate(element => element.href, elem);
    }
    async pressTab(element) {
        await element.press('Tab');
    }

    async pressEnter(element) {
        await element.press('Enter');
    }
    

    async elementExists(path) {
        try {
            const elem = await this.getElementByXpath(path, 1000, false);
            if (elem) {
                return true;
            }
            else {
                return false;
            }

        } catch (err) {
            console.error(err);
            return false;
        }
    }
    async getContentIfTextExists(text, tag) {
        try {
          const elements = await this.page.$$(tag);

          if (elements.length === 0) return null;
      
          let textFound = null;

          for (const element of elements) {
            const elementText = await this.page.evaluate(element => element.innerText, element);

            if (elementText.includes(text)) {
              textFound = await this.page.evaluate(element => element.nextElementSibling.innerText, element);
              break;
            }
          }
      
          return textFound;
        } catch (err) {
          console.error(`Erro ao encontrar texto: ${text}`);
          console.error(err.stack);
          throw err;
        }
      }

    async newWindowUrl() {
        await sleep(3000);
        const pages = await this.page.browser().pages();
        const newPage = await pages[pages.length - 1];
        await sleep(3000);
        this.old_window.push(this.page);
        this.page = newPage;
    }
    async returnOldWindow() {
        const oldPage = this.page;
        this.page = this.old_window.pop();
        await oldPage.close();
        await this.page.bringToFront();
    }


    async selectAndWait(xpath, timeout=1000, log=true) {
        try{
        await this.page.waitForSelector(`xpath/${xpath}`, { visible: true }, timeout);
        }catch(err){
            if (log)
                console.log("timeout error para elemento ", xpath)
        }
        return await this.getElementByXpath(xpath,timeout, log);


    }

    async getCurrentUrl() {
        return await this.page.getCurrentUrl();
    }

    async takeScreenshot (nomearquivo){
        await this.page.screenshot({path: nomearquivo});
    }

    async getUrlByXpath(xpath, log=true) {
        const elemento = await this.selectAndWait(xpath, 2000, log);
        const value = await elemento.evaluate(el => el.href)
        return value
    }

    async goToNextPage(newPage) {

        const queryPagina = {
            'page': newPage
        }

        let urlProximaPagina = await this.createNewUrlWithParameter(queryPagina, this.urlInicialPagina)

        console.log("Acessando página " + urlProximaPagina);
        await this.goToUrl(urlProximaPagina);

        return urlProximaPagina;
    }

    cleanText(text) {
        return text?.replace(/(\r\n|\n|\r)/gm, " ").trim();
    }

    async titleCase(str) {
        return str.toLowerCase().split(' ').map(function (word) {
            if (word === 'de' || word === 'da' || word === 'das' || word === 'do' || word === 'dos') {
                return word;
            }
            return (word.charAt(0).toUpperCase() + word.slice(1));
        }).join(' ');
    }


    async createNewUrlWithParameter(dicionarioQueryValores, url = "") {
        if (url == "") {
            url = await this.page.url();
        }

        const urlParams = new URLSearchParams(url.split('?')[1]);

        // para cada entrada, setar chave e url
        for (let key in dicionarioQueryValores) {
            urlParams.set(key, dicionarioQueryValores[key]);
        }

        return (url.split('?')[0] + '?' + urlParams.toString());
    }

}

module.exports = BasePage;