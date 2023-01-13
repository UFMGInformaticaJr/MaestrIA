const MonocraticaObj = require('../../objects/TJAC/monocratica.js')
const PageMonocraticaClass = require('../../pages/TJAC/TJACPage.js');
const { randomUUID } = require('crypto');
const sleep = require('util').promisify(setTimeout);

const scrapSingleMonocratica = async (PageMonocratica, Monocratica, i) => {

   //pegando ID da api
    // let id = await RequestService.getID();
    let id = randomUUID();
    Monocratica.id_jurisprudencia = id;

    await PageMonocratica.renderPage();
    
    const numbers = await PageMonocratica.getNumbers();
    Monocratica.processo = numbers.processo;
    Monocratica.cod_cnj_tj = numbers.cod_cnj_tj;
    Monocratica.numero_unico_cnj = numbers.numero_unico_cnj;

    Monocratica.classe = await PageMonocratica.getClasse();
    Monocratica.classe = await PageMonocratica.titleCase(Monocratica.classe);


    Monocratica.relator = await PageMonocratica.getRelator()
    Monocratica.relator = Monocratica.relator?.split('.')[1].trim();
    Monocratica.relator = await PageMonocratica.titleCase(Monocratica.relator);
    

    Monocratica.data_julgamento = await PageMonocratica.getDataJulgamento();
    Monocratica.data_julgamento = Monocratica.data_julgamento.split(' ')[1];
 

    Monocratica.data_publicacao = await PageMonocratica.getDataPublicacao();
    Monocratica.data_publicacao = Monocratica.data_publicacao.split(' ')[1];

    // await sleep(3000)
    Monocratica.partes = await PageMonocratica.getPartes();
    Monocratica.partes = await PageMonocratica.cleanText(Monocratica.partes);

    await sleep(2000)  

    return Monocratica;

}

const scrapMonocraticas = async (callbackTotalPaginas, callbackPassarPagina, callbackResultado) => {
    
    const MAX_ELEMENTS_IN_PAGE = 20;
    
    const PageMonocratica = new PageMonocraticaClass();

    await PageMonocratica.init();

    let currentPage = 1;

    const ArrayMonocratica = []

    var Monocratica = { ...MonocraticaObj };
    
    let totalResultados =  await PageMonocratica.getTotalResultados();
    console.log("Total de Resultados " + totalResultados)
    
    let totalPaginas = Math.ceil(totalResultados / MAX_ELEMENTS_IN_PAGE);
    callbackTotalPaginas(totalPaginas);
    while (currentPage <= totalPaginas) {

        for(let i = 1; i <= MAX_ELEMENTS_IN_PAGE; i++){

            Monocratica = { ...MonocraticaObj };

            console.log("Monocratica " + i + " de " + MAX_ELEMENTS_IN_PAGE + " -- Página atual " + currentPage + " de " + totalPaginas)

            await scrapSingleMonocratica(PageMonocratica, Monocratica, i);
            await sleep(1000);
            ArrayMonocratica.push(Monocratica);

            callbackResultado(Monocratica);
        }

        currentPage++;
        console.log("Passando de pagina!")

        if(currentPage != totalPaginas){
            callbackPassarPagina(currentPage);
            //mudar de pagina e salvar seu novo link
            // linkInicial = await PageMonocratica.goToNextPage(currentPage);
        }

    }


    return ArrayMonocratica;


}


module.exports = scrapMonocraticas;



