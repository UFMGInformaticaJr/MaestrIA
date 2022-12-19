
const express = require('express');
const bodyParser = require('body-parser');
const controllerRouter = require('./router.js')

const scrapAcordao = require('./scrap/scrapAcordeao.js');
const scrapMonocraticas = require('./scrap/scrapMonocraticas.js');

const RequestService = require('./api/request.js')

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
        let links = await scrapMonocraticas();
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






