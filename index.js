
const { Builder, By, until, Key } = require('selenium-webdriver');
const express = require('express');
const bodyParser = require('body-parser');
const controllerRouter = require('./router.js')
const chrome = require('selenium-webdriver/chrome');

const scrapAcordao = require('./scrapAcordeao.js');

const Monocraticas = require('./monocraticas.js')


const app = express();

const port = 3000
app.use(bodyParser.json());
app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
})

app.use('/', controllerRouter)

app.get('/acordeao', async (request, response) => {
    try {
        let links = await scrapAcordao();
        response.status(200).json(links)
    } catch (error) {
        console.log(error)
    }
})
app.get('/monocraticas', async (request, response) => {
    try {
        let links = await scrapingMonocraticas();
        response.status(200).json(links)
    } catch (error) {
        console.log(error)
    }
})

    //funcao para deixar so as iniciais em letra maiuscula e as preposiçoes em minuscula
    function titleCase(str) {
        return str.toLowerCase().split(' ').map(function(word) {
            if(word === 'de' || word === 'da' || word === 'das' || word === 'do' || word === 'dos' ){
                return word;
            }
            return (word.charAt(0).toUpperCase() + word.slice(1));
        }).join(' ');
    }

async function scrapingMonocraticas() {
    const driver = await new Builder().forBrowser('chrome').build(); //
    driver.manage().window().maximize();
    try {
        let elemento
        await driver.get('https://jurisprudencia.stf.jus.br/pages/search')
        await driver.sleep(3000)

        // parte de CONSULTA
        elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/mat-form-field/div/div[1]/div[4]/div/mat-icon[3]'));
        await elemento.click();


        // SELECIONA MONOCRATICAS
        elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[1]/div/mat-radio-group/span[4]/mat-radio-button/label/div[1]/div[2]'))
        elemento.click()


        // DESABILITA BUSCA ENTRE ASPAS
        elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[1]/div[2]/mat-checkbox[2]/label/div/input'))
        driver.executeScript("arguments[0].click();", elemento);

        //HABILITA BUSCA POR RADICAIS
        elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[1]/div[2]/mat-checkbox[1]/label/div/input'))
        driver.executeScript("arguments[0].click();", elemento);

        //CAMPO DE BUSCA
        elemento = driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[2]/div/mat-form-field/div/div[1]/div[3]/input'))
        elemento.sendKeys('monocratica') //mudar para variavel posteriormente

        //BOTAO PESQUISAR
        elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[2]/button[2]'))
        elemento.click()

        //Filtra Datas (tive que colocar varios awaits para dar tempo de carregar a pagina)
        await driver.sleep(1000)
        elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/div/div/div[1]/div[2]/div[3]/div/div[2]/mat-form-field[1]/div/div[1]/div[3]/input'))
        elemento.click()
        await elemento.sendKeys('01/01/2000')
        elemento.sendKeys(Key.ENTER)
     
        await driver.sleep(3000)

        elemento = await  driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/div/div/div[1]/div[2]/div[3]/div/div[2]/mat-form-field[2]/div/div[1]/div[3]/input'))
        await  elemento.click()
        await elemento.sendKeys('01/01/2021')
        await elemento.sendKeys(Key.TAB)
      
    
      
        await driver.sleep(3000)

        //cliclar no link de dados completos
        elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/div/div/div[2]/div/div[2]/div[1]/a'))
        elemento.click()

        await driver.sleep(3000)
        //---------------IMPLEMNTAR A PARTE DAS PÁGINAS E MUDAR A QUANTIDADE DE PÁGINAS PELO HTML PRA 250--------------------------------------
     
       
        //parte da COLETA mudar para funçao
  
        //CHECAR SE EXISTE ELEMENTOS NA PÁGINA
        const indexacao = await driver.findElements(By.xpath('//h4[contains(text(), "Indexação")]'))
        const legislacao = await driver.findElements(By.xpath("//h4[contains(text(), 'Legislação')]"))
        const notas_obervacoes_gerais = await driver.findElements(By.xpath("//h4[contains(text(), 'Observação')]"))
        const mono_msm_sentido = await driver.findElements(By.xpath("//h4[contains(text(), 'Decisões no mesmo sentido')]"))
        const doutrina = await driver.findElements(By.xpath("//h4[contains(text(), 'Doutrina')]"))

        let textoIndexacao;
        let textoLegislacao;
        let textoObservacao;
        let textoMonoMsmSentido;
        let textoDoutrina;


        for(const elementos of indexacao){
           textoIndexacao = elementos.findElement(By.xpath("following-sibling::*"))
        }

        for(const elementos of legislacao){
            textoLegislacao = elementos.findElement(By.xpath("following-sibling::*"))
        }

        for(const elementos of notas_obervacoes_gerais){
            textoObservacao = elementos.findElement(By.xpath("following-sibling::*"))
        }

        for(const elementos of mono_msm_sentido){
            textoMonoMsmSentido = elementos.findElement(By.xpath("following-sibling::*"))
        }

        for(const elementos of doutrina){
            textoDoutrina = elementos.findElement(By.xpath("following-sibling::*"))
        }



        Monocraticas.id_jurisprudencia = 1;
        Monocraticas.url_jurisprudencia_tribunal = await driver.getCurrentUrl();

        Monocraticas.processo = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/app-search-detail/div/div/div[2]/div/div[1]/div[1]/h4[1]')).getText();
        Monocraticas.processo = Monocraticas.processo.split('-')[0];
        
     
        Monocraticas.classe = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/app-search-detail/div/div/div[2]/div/div[1]/div[1]/h4[2]')).getText();
        Monocraticas.classe = titleCase(Monocraticas.classe);


        Monocraticas.relator = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/app-search-detail/div/div/div[2]/div/div[1]/div[1]/h4[3]')).getText();
        Monocraticas.relator = Monocraticas.relator.split('.')[1];
        Monocraticas.relator = titleCase(Monocraticas.relator);

        Monocraticas.data_julgamento = await driver.findElement(By.xpath('//*[@id="scrollId"]/div/div[2]/div/div[1]/div[1]/div/h4[1]')).getText();
        Monocraticas.data_julgamento = Monocraticas.data_julgamento.split(' ')[1];

        Monocraticas.data_publicacao = await driver.findElement(By.xpath('//*[@id="scrollId"]/div/div[2]/div/div[1]/div[1]/div/h4[2]')).getText();
        Monocraticas.data_publicacao = Monocraticas.data_publicacao.split(' ')[1];

        Monocraticas.partes = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/app-search-detail/div/div/div[2]/div/div[3]/div')).getText();
        Monocraticas.partes = Monocraticas.partes.replace(/(\r\n|\n|\r)/gm, " ");
        
        Monocraticas.decisao_jurisprudencia = await driver.findElement(By.xpath('//*[@id="decisaoTexto"]')).getText();
        Monocraticas.decisao_jurisprudencia = Monocraticas.decisao_jurisprudencia.replace(/(\r\n|\n|\r)/gm, " ");
        


        //CHECAGEM DE DADOS, SE EXISTIR ADICIONAR AO OBJETO
        if (indexacao.length > 0) {
            Monocraticas.indexacao = await textoIndexacao.getText();
            Monocraticas.indexacao = Monocraticas.indexacao.replace(/(\r\n|\n|\r)/gm, " ");
        }
           
        
        if (legislacao.length > 0){
            Monocraticas.legislacao = await textoLegislacao.getText();
            Monocraticas.legislacao = Monocraticas.legislacao.replace(/(\r\n|\n|\r)/gm, " ");
        }

        if (notas_obervacoes_gerais.length > 0){
            Monocraticas.notas_obervacoes_gerais = await textoObservacao.getText();
            Monocraticas.notas_obervacoes_gerais = Monocraticas.notas_obervacoes_gerais.replace(/(\r\n|\n|\r)/gm, " ");
        }

        if (mono_msm_sentido.length > 0){
            Monocraticas.monocraticas_mesmo_sentido = await textoMonoMsmSentido.getText();
            Monocraticas.monocraticas_mesmo_sentido = Monocraticas.monocraticas_mesmo_sentido.replace(/(\r\n|\n|\r)/gm, " ");
        }

        if (doutrina.length > 0){
            Monocraticas.dados_dourtrina = await textoDoutrina.getText();
            Monocraticas.dados_dourtrina = Monocraticas.dados_dourtrina.replace(/(\r\n|\n|\r)/gm, " ");
        }


        //ACOMPANHAMENTO PROCESSUAL
        const currentWindow = await driver.getWindowHandle();

        // const assert = require('assert');
        // assert (await driver.getAllWindowHandles().length 1);

        elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/app-search-detail/div/div/div[2]/div/div[1]/div[2]/div/mat-icon[1]'))
        
        
        await driver.wait(until.elementIsVisible(elemento), 3000);         
        await driver.wait(until.elementIsEnabled(elemento), 3000);         
        await elemento.click();

    
        await driver.sleep(3000)

        //mudar para a nova aba
        const newWindow = (await driver.getAllWindowHandles()).filter(handle => handle !== currentWindow)[0];
        await driver.switchTo().window(newWindow);

        await driver.sleep(3000)

        //pegando número unico
        Monocraticas.numero_unico_cnj = await driver.findElement(By.xpath('//*[@id="texto-pagina-interna"]/div/div/div/div[1]/div[1]/div[2]')).getText();
        Monocraticas.numero_unico_cnj = Monocraticas.numero_unico_cnj.split(' ')[2];

        //pegando assunto
        Monocraticas.assunto = await driver.findElement(By.xpath('//*[@id="informacoes-completas"]/div[1]/div[2]/div[2]/ul/li')).getAttribute('innerText');
        Monocraticas.assunto = Monocraticas.assunto.replace(/(\r\n|\n|\r)/gm, " ");

        //pegando url do processo
        Monocraticas.url_processo_tribunal = await driver.getCurrentUrl();

        //pegando número de origem
        Monocraticas.numeros_origem =  await driver.findElement(By.xpath('//*[@id="informacoes-completas"]/div[2]/div[1]/div[2]/div[8]')).getAttribute('innerText');
        Monocraticas.numeros_origem = Monocraticas.numeros_origem.replace(/(\r\n|\n|\r)/gm, "");
        Monocraticas.numeros_origem = Monocraticas.numeros_origem.trim(); //tira os espaços em branco

        //pegando tribunal de origem
        Monocraticas.tribunal_origem = await driver.findElement(By.xpath('//*[@id="informacoes-completas"]/div[2]/div[1]/div[2]/div[4]')).getAttribute('innerText');
        Monocraticas.tribunal_origem = Monocraticas.tribunal_origem.replace(/(\r\n|\n|\r)/gm, " ");
        Monocraticas.tribunal_origem = Monocraticas.tribunal_origem.trim(); 
        Monocraticas.tribunal_origem = titleCase(Monocraticas.tribunal_origem);

        //voltando para a aba anterior
        driver.close();
        await driver.switchTo().window(currentWindow);

        await driver.sleep(3000)

        //clicar no icone de mostrar integra e mudar para a nova aba
        try{
            elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/app-search-detail/div/div/div[2]/div/div[1]/div[2]/div/mat-icon[2]')).click();
            const newWindow2 = (await driver.getAllWindowHandles()).filter(handle => handle !== currentWindow)[0];
            //necessario fazer isso pq é um popup
            await driver.switchTo().window(newWindow2);
            await driver.sleep(3000)
            Monocraticas.url_pdf = await driver.getCurrentUrl();
            driver.close();
            await driver.switchTo().window(currentWindow);
        }catch(error){
            Monocraticas.url_pdf = "Não disponível";
       
        }
        


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

    return Monocraticas;

}



