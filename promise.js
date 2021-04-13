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
      let promises=[];
      for(let i=0;i<noOfAddresses;i++){
        const queryAddressCheck = reqAddresses[i].substr(0,4);
        if (queryAddressCheck!='http'){
          addresses[i]=`https://${reqAddresses[i]}`;    
        }
        else{
          addresses[i]=reqAddresses[i];
        }
        promises[i]= getTitle(addresses[i]);
      }
      let finalList=[];
      Promise.all(promises)
        .then(titles => {
          for(let i=0;i<noOfAddresses;i++){
            finalList[i]=`${reqAddresses[i]} - ${titles[i]}`;
          }
          res.render('multiple',{list: finalList});
        });

    } else {
      const queryAddressCheck = reqAddresses.substr(0,4);
      let address=reqAddresses;
      if (queryAddressCheck!='http'){
        address=`https://${req.query.address}`;    
      }
      const title = getTitle(address);
      title
        .then(siteTitle => {
            res.render('single',{title: `${reqAddresses} - ${siteTitle}`});
        });
    }
     
  });

function getTitle(address){
  return new Promise((resolve,reject) => {
    request(address, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          const $ = cheerio.load(body);
          const webpageTitle = $("title").text();
          const webpage = {
            title: webpageTitle,
          }
          const firstTitle=webpage.title;
          resolve(firstTitle);
        } else {
          const firstTitle='NO RESPONSE';
          resolve(firstTitle);
        }
    });
  });
    
}

app.get('*', function(req, res){
  res.status(404).send();
});

const port = process.env.PORT || 3000;

app.listen(port,() => console.log(`Listening to Port ${port}...`));