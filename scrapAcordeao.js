const Acordeao = require('./acordeao')

const { Builder, By, until, Key } = require('selenium-webdriver');
const scrapingAcordeao = async  () => {
    const driver = await new Builder().forBrowser('chrome').build(); //
    driver.manage().window().maximize();
    try {
        let elemento
        await driver.get('https://jurisprudencia.stf.jus.br/pages/search')
        await driver.sleep(3000)

        // abre a pesquisa avançada
        elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/mat-form-field/div/div[1]/div[4]/div/mat-icon[3]'));
        await elemento.click();



        // DESABILITA BUSCA ENTRE ASPAS
        elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[1]/div[2]/mat-checkbox[2]/label/div/input'))
        driver.executeScript("arguments[0].click();", elemento);

        //HABILITA BUSCA POR RADICAIS
        elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[1]/div[2]/mat-checkbox[1]/label/div/input'))
        driver.executeScript("arguments[0].click();", elemento);


        //colocar recurso na pesquisa em todos os campos
        elemento = driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[2]/div/mat-form-field/div/div[1]/div[3]/input'))
        elemento.sendKeys('recurso') //mudar para variavel posteriormente

        //BOTAO PESQUISAR
        elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[2]/button[2]'))
        elemento.click()

        //Filtra Datas (tive que colocar varios awaits para dar tempo de carregar a pagina)
        await driver.sleep(2000)
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

        await driver.sleep(2000)
        //---------------IMPLEMNTAR A PARTE DAS PÁGINAS E MUDAR A QUANTIDADE DE PÁGINAS PELO HTML PRA 250--------------------------------------
     
       
        //parte da COLETA mudar para funçao
  
        //CHECAR SE EXISTE ELEMENTOS NA PÁGINA
        const tema = await driver.findElements(By.xpath('//h4[contains(text(), "Tema")]'))
        //barra azul no canto superior direito
        const repercusao_geral = await driver.findElements(By.xpath('//div[contains(text(), "Repercussão Geral")]'))
        const indexacao = await driver.findElements(By.xpath('//h4[contains(text(), "Indexação")]'))
        const legislacao = await driver.findElements(By.xpath("//h4[contains(text(), 'Legislação')]"))
        const observacao = await driver.findElements(By.xpath("//h4[contains(text(), 'Observação')]"))
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

        for(const elementos of observacao){
            textoObservacao = elementos.findElement(By.xpath("following-sibling::*"))
        }

        for(const elementos of mono_msm_sentido){
            textoMonoMsmSentido = elementos.findElement(By.xpath("following-sibling::*"))
        }

        for(const elementos of doutrina){
            textoDoutrina = elementos.findElement(By.xpath("following-sibling::*"))
        }



        Acordeao.id = 1;
        Acordeao.url_jurisprudencia = await driver.getCurrentUrl();

        Acordeao.processo = await driver.findElement(By.xpath('//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[1]/h4[1]')).getText();
        Acordeao.processo = Acordeao.processo.split('-')[0];

        Acordeao.classe = await driver.findElement(By.xpath('//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[1]/h4[2]')).getText();
        Acordeao.classe = Acordeao.classe.split(' ')[0];

        Acordeao.relator = await driver.findElement(By.xpath('//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[1]/h4[3]')).getText();
        Acordeao.relator = ("Min.") + Acordeao.relator.split('.')[1];

        Acordeao.data_julgamento = await driver.findElement(By.xpath('//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[1]/div/h4[1]')).getText();
        Acordeao.data_julgamento = Acordeao.data_julgamento.split(' ')[1];

        Acordeao.data_publicacao = await driver.findElement(By.xpath('//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[1]/div/h4[2]')).getText();
        Acordeao.data_publicacao = Acordeao.data_publicacao.split(' ')[1];

        Acordeao.partes = await driver.findElement(By.xpath('//*[@id="mat-tab-content-0-0"]/div/div/div[4]/div')).getText();
        Acordeao.partes = Acordeao.partes.replace(/(\r\n|\n|\r)/gm, " ");
        
        Acordeao.decisao_jurisprudencia = await driver.findElement(By.xpath('//*[@id="mat-tab-content-0-0"]/div/div/div[6]/div')).getText();
        Acordeao.decisao_jurisprudencia = Acordeao.decisao_jurisprudencia.replace(/(\r\n|\n|\r)/gm, " ");
        


        //CHECAGEM DE DADOS, SE EXISTIR ADICIONAR AO OBJETO
        if (indexacao.length > 0) {
            Acordeao.indexacao = await textoIndexacao.getText();
            Acordeao.indexacao = Acordeao.indexacao.replace(/(\r\n|\n|\r)/gm, " ");
        }
           
        
        if (legislacao.length > 0){
            Acordeao.legislacao = await textoLegislacao.getText();
            Acordeao.legislacao = Acordeao.legislacao.replace(/(\r\n|\n|\r)/gm, " ");
        }

        if (observacao.length > 0){
            Acordeao.observacao = await textoObservacao.getText();
            Acordeao.observacao = Acordeao.observacao.replace(/(\r\n|\n|\r)/gm, " ");
        }

        if (mono_msm_sentido.length > 0){
            Acordeao.Acordeao_mesmo_sentido = await textoMonoMsmSentido.getText();
            Acordeao.Acordeao_mesmo_sentido = Acordeao.Acordeao_mesmo_sentido.replace(/(\r\n|\n|\r)/gm, " ");
        }

        if (doutrina.length > 0){
            Acordeao.dados_dourtrina = await textoDoutrina.getText();
            Acordeao.dados_dourtrina = Acordeao.dados_dourtrina.replace(/(\r\n|\n|\r)/gm, " ");
        }


        //ACOMPANHAMENTO PROCESSUAL
        const currentWindow = await driver.getWindowHandle();

        // const assert = require('assert');
        // assert (await driver.getAllWindowHandles().length 1);

        //clicar no icone de acompanhamento processual
        elemento = await driver.findElement(By.xpath('//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[2]/div/mat-icon[1]'))
        
        
        await driver.wait(until.elementIsVisible(elemento), 3000);         
        await driver.wait(until.elementIsEnabled(elemento), 3000);         
        await elemento.click();

    
        await driver.sleep(3000)

        //mudar para a nova aba
        const newWindow = (await driver.getAllWindowHandles()).filter(handle => handle !== currentWindow)[0];
        await driver.switchTo().window(newWindow);

        await driver.sleep(3000)

        //pegando número unico
        //verificar se o elemento existe

        //existem alguns que o cnpj nao existe, o texto diz sem numero unico
        const numeroCnpjXpath = '//*[@id="texto-pagina-interna"]/div/div/div/div[1]/div[1]/div[2]'
   
        const textpCnpj = await driver.findElement(By.xpath(numeroCnpjXpath)).getText();
        Acordeao.numero_unico_cnpj = textpCnpj.split('-')[0];
    


        //pegando assunto
        Acordeao.assunto = await driver.findElement(By.xpath('//*[@id="informacoes-completas"]/div[1]/div[2]/div[2]/ul/li')).getAttribute('innerText');
        Acordeao.assunto = Acordeao.assunto.replace(/(\r\n|\n|\r)/gm, " ");

        //pegando url do processo
        Acordeao.url_processo_tribunal = await driver.getCurrentUrl();

        //pegando número de origem
        Acordeao.numero_origem =  await driver.findElement(By.xpath('//*[@id="informacoes-completas"]/div[2]/div[1]/div[2]/div[8]')).getAttribute('innerText');
        Acordeao.numero_origem = Acordeao.numero_origem.replace(/(\r\n|\n|\r)/gm, "");
        Acordeao.numero_origem = Acordeao.numero_origem.trim(); //tira os espaços em branco

        //pegando tribunal de origem
        Acordeao.tribunal_origem = await driver.findElement(By.xpath('//*[@id="informacoes-completas"]/div[2]/div[1]/div[2]/div[4]')).getAttribute('innerText');
        Acordeao.tribunal_origem = Acordeao.tribunal_origem.replace(/(\r\n|\n|\r)/gm, " ");
        Acordeao.tribunal_origem = Acordeao.tribunal_origem.trim(); 

        //voltando para a aba anterior
        driver.close();
        await driver.switchTo().window(currentWindow);

        await driver.sleep(3000)

        
        //clicar no icone de mostrar integra e mudar para a nova aba
        try{
            const xpathInteiroTeor = '//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[2]/div/mat-icon[2]'
            elemento = await driver.findElement(By.xpath(xpathInteiroTeor)).click();
            const newWindow2 = (await driver.getAllWindowHandles()).filter(handle => handle !== currentWindow)[0];
            //necessario fazer isso pq é um popup
            await driver.switchTo().window(newWindow2);
            await driver.sleep(3000)
            Acordeao.url_inteiro_teor = await driver.getCurrentUrl();
            driver.close();
            await driver.switchTo().window(currentWindow);
        }catch(error){
            Acordeao.url_inteiro_teor = "Não disponível";
       
        }
        


        console.log(Acordeao)
    
    

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
        return error;
    } finally {
        await driver.quit();
    }

    return Acordeao;

}



module.exports = scrapingAcordeao 