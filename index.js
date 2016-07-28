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

  var content = "";
  var count = urls.length;

  if (count == 0) {
    return
  }
  for (var index in urls) {
    var url = urls[index];
    if (url.length > 0 && url.indexOf("http://v.youku.com") >= 0) {
        superagent.get(url)
          .end(function (err, sres) {
            count = count - 1;
            if (err) {
              if (count == 0) {
                res.send(content);
              }
              return ;
            }
            var $ = cheerio.load(sres.text);

            var irAlbumName = $('meta[name="irAlbumName"]').attr('content');
            var irTitle = $('meta[name="irTitle"]').attr('content');
            var keywords =  $('meta[name="keywords"]').attr('content');
            var videoCode = $('input[id="link4"]').attr('value');
            var image = $('a[id="s_qq_haoyou1"]').attr('href').split("pics=")[1].split("&")[0].replace("5420", "5410");

            var jsonObj = {
              url: url,
              title: irAlbumName + irTitle,
              keywords: keywords,
              videoCode: videoCode,
              image: image
            };


            var subContent =  "标题:" + "<br>" + irAlbumName + irTitle + "<br>" + "<br>";
            subContent = subContent + "关键词:" + "<br>" + keywords + "<br>" + "<br>";
            subContent = subContent + "缩略图:" + "<br>" + "<img src='"+image+"' />" + "<br>" + "<br>";
            subContent = subContent + "通用代码:" + "<br>" + "<input style='width:100%' value=\'" + videoCode  + "\'</input>" + "<br>" +"<br>" + "<br>" + "<br>";;

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
