
const { Builder, By, Key } = require('selenium-webdriver');
const express = require('express');
const bodyParser = require('body-parser');
const controllerRouter = require('./router.js')
const chrome = require('selenium-webdriver/chrome');

const Monocraticas = require('./monocraticas.js')


const app = express();

const port = 3000
app.use(bodyParser.json());
app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
})

app.use('/', controllerRouter)

app.get('/test', async (request, response) => {
    try {
        let links = await scrapingMonocraticas();
        response.status(200).json(links)
    } catch (error) {
        console.log(error)
    }
})

async function scrapingMonocraticas() {
    const driver = await new Builder().forBrowser('chrome').build();  // .setChromeOptions(new chrome.Options().headless())
    let pdfDetails = [];
    try {
        let elemento
        await driver.get('https://jurisprudencia.stf.jus.br/pages/search/despacho82718/false')
        await driver.sleep(2000)

        // elemento = await driver.findElement(By.className('mat-icon notranslate mat-tooltip-trigger icon cursor-pointer ml-5 material-icons mat-icon-no-color'));
        // await driver.sleep(2000)
        // await elemento.click();


        // // SELECIONA MONOCRATICAS
        // await driver.sleep(2000)
        // elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[1]/div/mat-radio-group/span[4]/mat-radio-button/label/div[1]/div[2]'))
        // elemento.click()


        // // DESABILITA BUSCA ENTRE ASPAS
        // await driver.sleep(2000)
        // elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[1]/div[2]/mat-checkbox[2]/label/div/input'))
        // driver.executeScript("arguments[0].click();", elemento);

        // //HABILITA BUSCA POR RADICAIS
        // await driver.sleep(2000)
        // elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[1]/div[2]/mat-checkbox[1]/label/div/input'))
        // driver.executeScript("arguments[0].click();", elemento);

        // //CAMPO DE BUSCA
        // await driver.sleep(2000)
        // elemento = driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[2]/div/mat-form-field/div/div[1]/div[3]/input'))
        // elemento.sendKeys('monocratica') //mudar para variavel posteriormente

        // //BOTAO PESQUISAR
        // await driver.sleep(2000)
        // elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[2]/button[2]'))
        // elemento.click()

        // //Filtra Datas
        // await driver.sleep(2000)
        // elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/div/div/div[1]/div[2]/div[3]/div/div[2]/mat-form-field[1]/div/div[1]/div[3]/input'))
        // elemento.click()
        // driver.sleep(2000)

        // //cliclar no link de dados completos
        // elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/div/div/div[2]/div/div[2]/div[1]/a'))
        // elemento.click()
        // await driver.sleep(2000)


        
        //parte da coleta mudar para funçao
        Monocraticas.id = 1;
        Monocraticas.url_jurisprudencia = await driver.getCurrentUrl();

        await driver.sleep(2000)

        Monocraticas.processo = await driver.findElement(By.xpath('//*[@id="scrollId"]/div/div[1]/div/div[1]/div[1]/h4[1]')).getText();
        Monocraticas.processo = Monocraticas.processo.split('-')[0];

        Monocraticas.classe = await driver.findElement(By.xpath('//*[@id="scrollId"]/div/div[1]/div/div[1]/div[1]/h4[2]')).getText();
        Monocraticas.classe = Monocraticas.classe.split(' ')[0];

        Monocraticas.relator = await driver.findElement(By.xpath('//*[@id="scrollId"]/div/div[1]/div/div[1]/div[1]/h4[3]')).getText();
        Monocraticas.relator = ("Min.") + Monocraticas.relator.split('.')[1];

        
        Monocraticas.data_julgamento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/div/div[1]/div[1]/div/h4[1]')).getText();
        Monocraticas.data_julgamento = Monocraticas.data_julgamento.split(' ')[1];

        Monocraticas.data_publicacao = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/div/div[1]/div[1]/div/h4[2]')).getText();
        Monocraticas.data_publicacao = Monocraticas.data_publicacao.split(' ')[1];
        
        Monocraticas.decisao_jurisprudencia = await driver.findElement(By.xpath('//*[@id="decisaoTexto"]')).getText();
        Monocraticas.decisao_jurisprudencia = Monocraticas.decisao_jurisprudencia.replace(/(\r\n|\n|\r)/gm, " ");


        console.log(Monocraticas)
    
    




        //PEGAR TODOS DA PÁGINA
        // var pdfs = await driver.findElements(By.className('mat-tooltip-trigger ng-star-inserted'))

        // for (const pdf of pdfs) {
        //     let link = await pdf.getAttribute('href')

        //     linksDetails.push({
        //         link: link ?? 'Não tem pdf',
        //     });

        // }


    } catch (error) {
        console.log(error);
        return false
    } finally {
        await driver.quit();
    }

    return pdfDetails

}



