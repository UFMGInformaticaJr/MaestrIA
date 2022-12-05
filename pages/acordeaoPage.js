const {Key} = require('selenium-webdriver');
var BasePage = require ('./basepage');

class AcordeaoPage extends BasePage{

   
    async enter_url(theURL){
        await this.go_to_url(theURL);
    }
    async setUpSearchOptions(){
        await super.setUpSearchOptions('acordeao');
    }
    async enter_search(searchText){
        var searchField = 'input[name=q]';
        await this.enterTextByCss(searchField, searchText);
        await this.enterTextByCss(searchField, Key.RETURN);
    }
}
module.exports = AcordeaoPage;