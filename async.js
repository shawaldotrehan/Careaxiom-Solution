const Express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const app = Express();

app.use(Express.json());
app.set('view engine', 'pug');


app.get('/I/want/title', (req,res) => {
    const reqAddresses = req.query.address;
    if(Array.isArray(req.query.address)){
      const noOfAddresses = req.query.address.length;
      let addresses=[];
      for(let i=0;i<noOfAddresses;i++){
        const queryAddressCheck = reqAddresses[i].substr(0,4);
        if (queryAddressCheck!='http'){
          addresses[i]=`https://${reqAddresses[i]}`;    
        }
        else{
          addresses[i]=reqAddresses[i];
        }
      }
      displayMultipleTitles(addresses,res,reqAddresses,noOfAddresses);
    } else {
      const queryAddressCheck = req.query.address.substr(0,4);
      let address=req.query.address;
      if (queryAddressCheck!='http'){
        address=`https://${req.query.address}`;    
      }
      displaySingleTitle(address,res,reqAddresses);
    }
     
  });

async function displaySingleTitle(address,res,reqAddress){
  try{
    const title = await getTitle(address)
    res.render('single',{title: `${reqAddress} - ${title}`});
  }
  catch (err){
    res.render('single',{title: `${reqAddress} - ${err}`});
  }
}

async function displayMultipleTitles(addresses,res,reqAddresses,noOfAddresses){
  try{  
    let titles = [];
    let finalList=[];
    for(let i=0;i<noOfAddresses;i++){
      titles.push(await getTitle(addresses[i]));
      finalList[i]=`${reqAddresses[i]} - ${titles[i]}`;
    }
    res.render('multiple',{list: finalList});
  }
  catch (err){
    res.send(err);
  }
}

function getTitle(address){
  return new Promise((resolve,reject) => {
    request(address, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          const $ = cheerio.load(body);
          const webpageTitle = $("title").text();
          const webpage = {
            title: webpageTitle,
          }
          firstTitle=webpage.title;
          resolve(firstTitle);
        } else {
          firstTitle='NO RESPONSE';
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
