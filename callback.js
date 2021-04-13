const Express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const app = Express();

app.use(Express.json());
app.set('view engine', 'pug');


app.get('/I/want/title', (req,res) => {
    const reqAddresses = req.query.address;
    if(Array.isArray(req.query.address)){
      let addresses=[];
      const noOfAddresses = req.query.address.length;
      let finalList=[];
      let noOfCalls=noOfAddresses;
      for(let i=0;i<noOfAddresses;i++){
        const queryAddressCheck = reqAddresses[i].substr(0,4);
        if (queryAddressCheck!='http'){
          addresses[i]=`https://${reqAddresses[i]}`;    
        }
        else{
          addresses[i]=reqAddresses[i];
        }
        getTitle(addresses[i], (siteTitle) => {
          finalList[i]=`${reqAddresses[i]} - ${siteTitle}`;
          --noOfCalls;
          if(noOfCalls==0){
            res.render('multiple',{list: finalList});
          }
        });
      }
      
    } else {
      let address=reqAddresses;
      const queryAddressCheck = reqAddresses.substr(0,4);
      if (queryAddressCheck!='http'){
        address=`https://${reqAddresses}`;    
      }
      getTitle(address, (siteTitle) => {
        res.render('single',{title: `${reqAddresses} - ${siteTitle}`});
      });
    }
    
  });
  

function getTitle(address, callback){
  request(address, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(body);
      const webpageTitle = $("title").text();
      const webpage = {
        title: webpageTitle,
      }
      const firstTitle=webpage.title;
      callback(firstTitle);
    } else {
      const title='NO RESPONSE';
      callback(title);
    }
});
}

app.get('*', function(req, res){
  res.status(404).send();
});

const port = process.env.PORT || 3000;

app.listen(port,() => console.log(`Listening to Port ${port}...`));