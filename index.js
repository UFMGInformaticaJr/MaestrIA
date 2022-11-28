
const { Builder, By, Key } = require('selenium-webdriver');
const { fork } = require('child_process')
const express = require('express');
const bodyParser = require('body-parser');


const app = express();

const port = 3000
app.use(bodyParser.json());
app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
})


//create uuid
const uuid = require('uuid');


class mutex {
    constructor() {
        this.locked = false
    }

    acquire() {
        if (this.locked) {
            return false;
        }
        else {
            this.locked = true

            return true
        }
    }

    release() {
        this.locked = false
    }
}



let crawlerId = 0
let mutexOcioso = new mutex()

let child = null

let lastStatus = 'ocioso'



const createChild = () => {

    //checkar se child ainda esta conectado
    if (child != null && child.connected) {
        console.log('child ainda vivo, matando')
        child.disconnect()
    }

    child = fork('./mock_crawler.js')
    console.log("______________ nova thread _____________")
    console.log("PID do crawler recem criado: " + child.pid)


    child.on('message', ([type, message]) => {

        console.log("Crawler " + crawlerId)

        console.log(message)


        if (type == 'end') {
            mutexOcioso.release()
            console.log('Crawler ' + crawlerId + ' acabou com sucesso')
        }
        else if (type == 'status') {
            lastStatus = message
        }
        else if (type == 'stop') {
            lastStatus = message
        }
    })

    child.on('error', (error) => {
        console.log("Um erro fatal aconteceu, o que nao deveria rolar ja que tenho um try catch")
        console.log(error)
        mutexOcioso.release()
    })

}
app.get('/health', (req, res) => {

    if (mutexOcioso.locked) {
        child.send(['status'])
        res.send(`Crawler ${crawlerId} ocupado. Ultimo status: ${lastStatus}`)
    }
    else {
        res.send(`Crawler ocioso`)
    }

})

app.get('/stop', async (req, res) => {

    if (!mutexOcioso.locked) {
        res.send('Crawler ocioso, nao ha nada para parar')
        return
    }

    //envia stop para filho
    child.send(['stop'])

    //indica que o crawler esta ocioso
    mutexOcioso.release()
    console.log("Crawler parado forçadamente com sucesso")

    //criar outro processo ja que o anterior foi parado nao é necessario
    res.send(`Crawler ${crawlerId} interrompido`)

})

app.post('/start', async (req, res) => {

    const timeout = req.body.timeout
    const percentage = req.body.percentage


    const estaOcioso = mutexOcioso.acquire()

    if (!estaOcioso) {
        res.send(`Crawler ${crawlerId} ocupado`)
        return
    }
    //criar nova thread
    createChild()
    crawlerId = uuid.v4()


    parameters = {
        timeout: timeout ?? 3000,
        percentage: percentage ?? 0.5,
        id: crawlerId
    }
    //criar processo se o ultimo acabou, nao deve acontecer
    if (child == null || child.killed || child.exitCode != null) {
        console.warn("Crawler morreu, criando novo processo")
       
    }

    //enviar mensagem de inicio e parametros
    child.send(["start", parameters])

    //devolver uuid
    res.send(`Crawler ${crawlerId} started`)

})

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



