var superagent = require('superagent');
var express = require('express');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');

var fs = require("fs");

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
var router = express.Router();


app.get('/', router);
app.post('/showdetail', router);



router.get('/', function(req, res){
  var htmlCode =  fs.readFileSync('input').toString();
  res.send(htmlCode);
});


router.post('/showdetail', function(req, res){
  var urls = req.body.urls.split("\n");
  var userAgent = "Mozilla/5.0 (iPad; CPU OS 10_0 like Mac OS X) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/10.0 Mobile/14A300 Safari/602.1"
  var content = "";
  var count = urls.length;

  if (count == 0) {
    return
  }
  for (var index in urls) {
    var url = urls[index];
    if (url.length > 0 && url.indexOf("http://v.youku.com") >= 0) {

        // http://v.youku.com/v_show/id_XMTc0MzMxMzU5Mg==.html?from=s1.8-1-1.1&spm=a2h0k.8191407.0.0&x=1
        // superagent.
        var id = url.split("id_")[1].split(".html")[0];
        superagent.get(url)
          .set("User-Agent", userAgent)
          .end(function (err, sres) {
            count = count - 1;
            if (err) {
              if (count == 0) {
                res.send(content);
              }
              return ;
            }

            var $ = cheerio.load(sres.text);


            var titleRegx = new RegExp("<title>[^<]+</title>")
            var rs = titleRegx.exec(sres.text);
            var irTitle = rs[0].replace("<title>", "").replace("</title>", "");
            // var keywords =  $('meta[name="keywords"]').attr('content');
            var videoCode = "<iframe height=498 width=510 src=\'http://player.youku.com/embed/" + id + "\' frameborder=0 \'allowfullscreen\'></iframe>";
            var image = $('#share-qq').attr('href').split('imageUrl=')[1].split('&')[0].replace("05420", "05410");

            //


            var jsonObj = {
              url: url,
              title: irTitle,
              videoCode: videoCode,
              image: image
            };


            //<iframe height=498 width=510 src='http://player.youku.com/embed/XMTcyODQ4MTAyOA==' frameborder=0 'allowfullscreen'></iframe>

            var subContent =  "标题:" + "<br>"  + irTitle + "<br>" + "<br>";
            subContent = subContent + "缩略图:" + "<br>" + "<img src='"+image+"' />" + "<br>" + "<br>";
            subContent = subContent + "通用代码:" + "<br>" + "<input id='videoCode' style='width:100%' value=\"" +  videoCode + "\"</input>" + "<br>" +"<br>" + "<br>" + "<br>";

            content = content + subContent;

            console.log( JSON.stringify(jsonObj, null, "\t") + "\n");
            if (count == 0) {
              res.send(content);
            }
          });
      } else {
        count = count - 1;
        if (count == 0) {
          res.send(content);
        }
      }
    }
});


app.listen(3000, function () {
  console.log('app is listening at port 3000');
});
