const Express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const async = require('async');
const app = Express();

app.use(Express.json());
app.set('view engine', 'pug');


app.get('/I/want/title', (req,res) => {
    const reqAddresses = req.query.address;
    let stack = [];
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
        stack.push(
          function getTitle(callback){				
            request(addresses[i], function (error, response, body) {
              if (!error && response.statusCode == 200) {
                const $ = cheerio.load(body);
                const webpageTitle = $("title").text();
                const webpage = {
                title: webpageTitle,
                }
                const firstTitle=webpage.title;
                callback(null,firstTitle);
              } else {
                const title='NO RESPONSE';
                callback(null,title);
              }
            });
          });      
        
      }
      let finalList=[];
      async.parallel(stack, (err,result) => {
        for(let i=0;i<noOfAddresses;i++){
            finalList[i]=`${reqAddresses[i]} - ${result[i]}`;
        }
        res.render('multiple',{list: finalList});
      })
    } else {
      const queryAddressCheck = req.query.address.substr(0,4);
      let address=req.query.address;
      if (queryAddressCheck!='http'){
        address=`https://${req.query.address}`;    
      }
      stack.push(
        function getTitle(callback){				
          request(address, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              const $ = cheerio.load(body);
              const webpageTitle = $("title").text();
              const webpage = {
              title: webpageTitle,
              }
              const firstTitle=webpage.title;
              callback(null,firstTitle);
            } else {
              const title='NO RESPONSE';
              callback(null,title);
            }
          });
        });
        async.parallel(stack, (err,result) => {
          res.render('single',{title: `${reqAddresses} - ${result}`});
        })   
    }
     
  });
  
app.get('*', function(req, res){
  res.status(404).send();
});

const port = process.env.PORT || 3000;

app.listen(port,() => console.log(`Listening to Port ${port}...`));
