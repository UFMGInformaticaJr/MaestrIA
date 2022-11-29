
const { Builder, By, Key } = require('selenium-webdriver');
const express = require('express');
const bodyParser = require('body-parser');
const controllerRouter = require('./router.js')


const app = express();

const port = 3000
app.use(bodyParser.json());
app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
})

app.use('/', controllerRouter)

app.get('/test', async (request, response) => {
    try {
        let links = await Scraping();
        response.status(200).json(links)
    } catch (error) {
        console.log(error)
    }
})

async function Scraping() {
    const driver = await new Builder().forBrowser('chrome').build()
    let pdfDetails = [];
    try {
        let elemento
        await driver.get('https://jurisprudencia.stf.jus.br/pages/search')
        await driver.sleep(2000)

        elemento = await driver.findElement(By.className('mat-icon notranslate mat-tooltip-trigger icon cursor-pointer ml-5 material-icons mat-icon-no-color'));
        await driver.sleep(2000)
        await elemento.click();


        // SELECIONA MONOCRATICAS
        await driver.sleep(2000)
        elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[1]/div/mat-radio-group/span[4]/mat-radio-button/label/div[1]/div[2]'))
        elemento.click()


        // DESABILITA BUSCA ENTRE ASPAS
        await driver.sleep(2000)
        elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[1]/div[2]/mat-checkbox[2]/label/div/input'))
        driver.executeScript("arguments[0].click();", elemento);

        //HABILITA BUSCA POR RADICAIS
        await driver.sleep(2000)
        elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[1]/div[2]/mat-checkbox[1]/label/div/input'))
        driver.executeScript("arguments[0].click();", elemento);

        //CAMPO DE BUSCA
        await driver.sleep(2000)
        elemento = driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[2]/div/mat-form-field/div/div[1]/div[3]/input'))
        elemento.sendKeys('civil')

        //BOTAO PESQUISAR
        await driver.sleep(2000)
        elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[2]/button[2]'))
        elemento.click()

        //Filtra Datas
        await driver.sleep(2000)
        elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/div/div/div[1]/div[2]/div[3]/div/div[2]/mat-form-field[1]/div/div[1]/div[3]/input'))
        elemento.click()
        driver.sleep(2000)

        var pdfs = await driver.findElements(By.className('mat-tooltip-trigger ng-star-inserted'))

        for (const pdf of pdfs) {
            let link = await pdf.getAttribute('href')
            linksDetails.push({
                link: link ?? 'Não tem pdf',
            });

        }


    } catch (error) {
        console.log(error);
        return false
    } finally {
        await driver.quit();
    }

    return pdfDetails

}



