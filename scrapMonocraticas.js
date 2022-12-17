const MonocraticaObj = require('./monocraticas.js')
const PageMonocraticaClass = require('./pages/monocraticaPage')


let PageMonocratica = null;

let currentPage = 1;

let listaMonocratica = [];


const scrapingSetup = async (PageMonocratica) => {
    await PageMonocratica.setUpSearchOptions();

    //Filtra Datas (tive que colocar varios awaits para dar tempo de carregar a pagina)
    await PageMonocratica.inserirDatas()
};


async function scrapSingleMonocratica (PageMonocratica, linkMonocratica) {
    
    //abrir pagina monocratica

    await PageMonocratica.openUrlAndWaitForPageLoad(linkMonocratica)

    //criar novo objeto

    const Monocratica = { ...MonocraticaObj };
    Monocratica.url_jurisprudencia_tribunal = linkMonocratica;

    let id = Monocratica.url_jurisprudencia_tribunal.split("/search/")[1]
    id = id.split("/")[0]
    //deixar apenas os numeros
    Monocratica.id_jurisprudencia = id.replace(/\D/g, '');

  
    //CHECAR SE EXISTE ELEMENTOS NA PÁGINA
    Monocratica.indexacao = await PageMonocratica.getContentIfTextExists("Indexação", "h4")
    Monocratica.legislacao = await PageMonocratica.getContentIfTextExists("Legislação", "h4")
    Monocratica.notas_obervacoes_gerais = await PageMonocratica.getContentIfTextExists("Observação", "h4")
    

    Monocratica.processo = await PageMonocratica.getProcesso();
    Monocratica.processo = Monocratica.processo.split(' ')[1];

    Monocratica.classe = await PageMonocratica.getClasse();
    Monocratica.classe = await PageMonocratica.titleCase(Monocratica.classe);
    

    Monocratica.relator = await PageMonocratica.getRelator()
    Monocratica.relator = Monocratica.relator?.split('.')[1].trim();
    Monocratica.relator = await PageMonocratica.titleCase(Monocratica.relator);

    Monocratica.data_julgamento = await PageMonocratica.getDataJulgamento();
    Monocratica.data_julgamento = Monocratica.data_julgamento.split(' ')[1];

    Monocratica.data_publicacao = await PageMonocratica.getDataPublicacao();
    Monocratica.data_publicacao = Monocratica.data_publicacao.split(' ')[1];

    Monocratica.partes = await PageMonocratica.getPartes();
    Monocratica.partes = await PageMonocratica.cleanText(Monocratica.partes);
    
    Monocratica.inteiro_teor_puro = await PageMonocratica.getInteiroTeorPuro();
    Monocratica.inteiro_teor_puro = PageMonocratica.cleanText(Monocratica.inteiro_teor_puro);

    Monocratica.ementa = Monocratica.inteiro_teor_puro;
    
    

    //ACOMPANHAMENTO PROCESSUAL

    await PageMonocratica.irPaginaAcompanhamentoProcessual();;

    //pegando número unico
    Monocratica.numero_unico_cnj = await PageMonocratica.getCnjCruAcompanhamentoProcessual();
    Monocratica.numero_unico_cnj = Monocratica.numero_unico_cnj.split(' ')[2];

    //pegando assunto
    Monocratica.assunto = await PageMonocratica.getAssuntoAcompanhamentoProcessual();
    Monocratica.assunto = await PageMonocratica.cleanText(Monocratica.assunto);

    //pegando url do processo
    Monocratica.url_processo_tribunal = await PageMonocratica.getUrlProcessoTribunalAcompanhamentoProcessual();


    //pegando número de origem
    Monocratica.numeros_origem = await PageMonocratica.getNumeroOrigemAcompanhamentoProcessual();
    Monocratica.numeros_origem = await PageMonocratica.cleanText(Monocratica.numeros_origem);

    //pegando tribunal de origem
    Monocratica.tribunal_origem = await PageMonocratica.getTribunalOrigemAcompanhamentoProcessual();
    Monocratica.tribunal_origem = await PageMonocratica.cleanText(Monocratica.tribunal_origem);
    Monocratica.tribunal_origem = await PageMonocratica.titleCase(Monocratica.tribunal_origem);

    //voltando para a aba anterior
   
    await PageMonocratica.returnOldWindow();

    //clicar no icone de mostrar integra e mudar para a nova aba
    Monocratica.url_pdf = await PageMonocratica.getLinkTeorIntegra();

    console.log(Monocratica)
    

    return Monocratica;

}

async function scrapMonocratica() {
    try {
        PageMonocratica = new PageMonocraticaClass();

        await scrapingSetup(PageMonocratica);

        const totalPaginas = 1;

     
        while (currentPage <= totalPaginas) {
            const monocraticaPage = await PageMonocratica.scrapAllDocumentsInPage(scrapSingleMonocratica);
            listaMonocratica.push(...monocraticaPage);
            currentPage++;
        }

        console.log(listaMonocratica);

        return listaMonocratica;
    }catch (error ){
        console.log(error)
    }
    finally {
        await driver.quit()
    }

    
}






module.exports = scrapMonocratica;