
const express = require('express');
const bodyParser = require('body-parser');
const controllerRouter = require('./router.js')

const scrapAcordao = require('./scrap/STF/scrapAcordeao.js');
const scrapMonocraticas = require('./scrap/STF/scrapMonocratica.js');

const scrapTJACMonocraticas = require('./scrap/TJAC/scrapMonocratica.js');

const RequestService = require('./api/request.js')

const app = express();

const port = 3000
app.use(bodyParser.json());
app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
})

app.use('/', controllerRouter);





//rotas para testar o scrap individual
let totalPaginas = 0;
const resultados = []
let paginaAtual = 1;

const mockAtualizarTotalPaginas = (total) => {
    totalPaginas = total
}

const mockPassarDePagina = () => {
    paginaAtual += 1
}
const mockSalvarResultado = (resultado) => {
    resultados.push(resultado)
}

app.get('/acordeao', async (request, response) => {
    try {
        let links = await scrapAcordao(1, "20/05/2020" , "21/05/2020", mockAtualizarTotalPaginas, mockPassarDePagina, mockSalvarResultado);
        
        response.status(200).json(links)
    } catch (error) {
        console.log(error)
    }
})
app.get('/monocraticas', async (request, response) => {
    try {
        let links = await scrapMonocraticas(1, "20/05/2020" , "21/05/2020", mockAtualizarTotalPaginas, mockPassarDePagina, mockSalvarResultado);
        console.log(resultados)
        response.status(200).json(links)
    } catch (error) {
        console.log(error)
    }
})

app.get('/TJACmonocraticas', async (request, response) => {
    try {
        let links = await scrapTJACMonocraticas(1, "20/05/2020" , "21/05/2020", mockAtualizarTotalPaginas, mockPassarDePagina, mockSalvarResultado);
        console.log(resultados)
        response.status(200).json(links)
    } catch (error) {
        console.log(error)
    }
})

app.get('/request', async (request, response) => {
    try {
        let id = await RequestService.getID();
        response.status(200).json(id)
      
    } catch (error) {
        console.log(error)
    }
})

app.get('/teste', async (request, response) => {
    try {
       await takeScreenshot();
      
    } catch (error) {
        console.log(error)
    }
})








