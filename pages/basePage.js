var webdriver = require('selenium-webdriver');
const { Builder, By, until, Key } = require('selenium-webdriver');


class BasePage {

    base_url = 'https://jurisprudencia.stf.jus.br/pages/search';

    iconePesquisaAvancada = '/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/mat-form-field/div/div[1]/div[4]/div/mat-icon[3]';
    botaoBuscaEntreAspas = 'html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[1]/div[2]/mat-checkbox[2]/label/div/input';
    botaoBuscaRadicais = '/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[1]/div[2]/mat-checkbox[1]/label/div/input';
    inputPesquisa = '/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[2]/div/mat-form-field/div/div[1]/div[3]/input';
    botaoPesquisar = '/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[2]/button[2]'

    constructor() {
        var driver = new webdriver.Builder().forBrowser('chrome').build();
        driver.manage().setTimeouts({ implicit: (10000) });
        global.driver = driver;

    }

    async go_to_url(theURL) {
        await driver.get(theURL);
    }
    async enterTextByCss(css, searchText) {
        await driver.findElement(By.css(css)).sendKeys(searchText);
    }
    async getElementByXpath(xpath) {
        return await driver.findElement(By.xpath(xpath));
    }
    async getTextUsingSelector(path, func = this.getElementByXpath) {
        return await func(path).getText();
    }
    async clickById(id) {
        await driver.findElement(By.id(id)).click();
    }
    async clickByXpath(xpath) {
        await driver.findElement(By.xpath(xpath)).click();
    }
    async pressTab(element) {
        await element.sendKeys(webdriver.Key.TAB);
    }


    async elementExists(path, func = this.getElementByXpath) {
        try {
            const elem = await func(path);
            if (elem) {
                return true;
            }
            else {
                return false;
            }

        } catch (err) {
            return false;
        }
    }
    async getTextIfTextExists(path, text, tag = 'div') {
        const foundElements = await driver.findElements(By.xpath(`//${tag}[contains(text(), "${text}")]`));

        if (foundElements === null || foundElements.length === 0)
            return null;

        let textFound = null;
        for (const elementos of foundElements) {
            textFound = elementos.findElement(By.xpath("following-sibling::*"))
        }

        return await textFound.getText();

    }

    async newWindowUrl() {
        const handles = await driver.getAllWindowHandles();
        return handles.filter(handle => handle !== currentWindow)[0];
    }
    async switchToNewWindow() {
        const newWindow = await this.newWindowUrl();
        await driver.switchTo().window(newWindow);
    }

    cleanText(text) {
        return text.replace(/(\r\n|\n|\r)/gm, " ").trim();
    }

    async waitUntilElementIsVisible(element, timeout = 3000) {
        await driver.wait(webdriver.until.elementIsVisible(element), timeout);
    }
    async waitUntilElementIsEnabled(element, timeout = 3000) {
        await driver.wait(webdriver.until.elementIsEnabled(element), timeout);
    }

    async selectAndWait(xpath, timeout = 3000, mode = 'visible') {
        const element = await this.getElementByXpath(xpath);

        //let el = await driver.findElement(By.xpath(xpath));
        //await driver.wait(until.elementIsVisible(el),100);

        if (!element )
            throw new Error(`Element ${xpath} not found`);

        if (mode === 'visible') {
            await this.waitUntilElementIsVisible(element, timeout);
        }
        else if (mode === 'enabled') {
            await this.waitUntilElementIsEnabled(element, timeout);
        }
        else {
            throw new Error('Invalid wait mode');
        }
    }

    async getWindowHandle() {
        return await driver.getWindowHandle();
    }

    async closeBrowser() {
        await driver.quit();
    }

    async setUpSearchOptions(type='acordeao') {
        driver.manage().window().maximize()
        let elemento


        await this.go_to_url(this.base_url);

        await this.selectAndWait(this.iconePesquisaAvancada, 20000);

        // abre a pesquisa avançada

        await this.clickByXpath(this.iconePesquisaAvancada);



        // DESABILITA BUSCA ENTRE ASPAS
        elemento = await driver.findElement(By.xpath(this.botaoBuscaEntreAspas));
        driver.executeScript("arguments[0].click();", elemento);

        //HABILITA BUSCA POR RADICAIS
        elemento = await driver.findElement(By.xpath(this.botaoBuscaRadicais));
        driver.executeScript("arguments[0].click();", elemento);


        //colocar recurso na pesquisa em todos os campos
        elemento = driver.findElement(By.xpath(this.inputPesquisa))

        let searchQuery;

        if (type == 'monocraticas' || type == 'monocratica') {
            searchQuery = 'monocratica'
        }
        else if (type == 'acordeao' || type == 'acordeao') {
            searchQuery = 'recurso'
        }
        else {
            throw new Error('Invalid search type, must be acordeao or monocratica');
        }

        elemento.sendKeys(searchQuery) //mudar para variavel posteriormente

        //BOTAO PESQUISAR
        elemento = await driver.findElement(By.xpath(this.botaoPesquisar))
        elemento.click()
    }
}

module.exports = BasePage;