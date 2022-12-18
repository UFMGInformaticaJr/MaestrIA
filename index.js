
const express = require('express');
const bodyParser = require('body-parser');
const controllerRouter = require('./router.js')

const scrapAcordao = require('./scrapAcordeao.js');
const scrapMonocraticas = require('./scrapMonocraticas.js');

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






