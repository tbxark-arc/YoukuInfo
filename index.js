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
  var userAgent = "Paw/2.3.1 (Macintosh; OS X/10.12.0) GCDHTTPRequest"//"Mozilla/5.0 (iPad; CPU OS 10_0 like Mac OS X) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/10.0 Mobile/14A300 Safari/602.1"
  var content = "";
  var count = urls.length;

  if (count == 0) {
    return
  }
  for (var index in urls) {
    var url = urls[index];
    if (url.length > 0 && url.indexOf("http://v.youku.com") >= 0) {

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
          try {
            var $ = cheerio.load(sres.text);
            var titleRegx = new RegExp("<title>[^<]+</title>")
            var rs1 = titleRegx.exec(sres.text);
            var videoTitle = rs1[0].replace("<title>", "").replace("</title>", "").split("在线播放")[0];

            var videoIdRegx = new RegExp("videoId2= '[a-zA-Z0-9=]*");
            var rs2 = videoIdRegx.exec(sres.text);
            var videoId = rs2[0].replace("videoId2= '", "");

            var irTitle =  videoTitle
            // var keywords =  $('meta[name="keywords"]').attr('content');
            var videoCode = "<iframe height=498 width=510 src=\'http://player.youku.com/embed/" + videoId + "\' frameborder=0 \'allowfullscreen\'></iframe>";
            // var image = $('#share-qq').attr('href').split('imageUrl=')[1].split('&')[0].replace("05420", "05410");
            var image = $('#s_qq_haoyou1').attr('href').split('pics=')[1].split('&')[0].replace("05420", "05410").replace("r1", "r4");
            var realUrl = "http://v.youku.com/v_show/id_" + videoId + ".html";


            var jsonObj = {
              url: url,
              title: irTitle,
              videoCode: videoCode,
              image: image
            };

            var subContent =  "标题:" + "<br>"  + irTitle + "<a href='" + realUrl + "'>" + "[跳转网页]  " + "<a>"  + "<br>" + "<br>";
            subContent = subContent + "缩略图:" + "<br>" + "<img src='"+image+"' />" + "<br>" + "<br>";
            subContent = subContent + "通用代码:" + "<br>" + "<input id='videoCode' style='width:100%' value=\"" +  videoCode + "\"</input>" + "<br>" +"<br>" + "<br>" + "<br>";

            content = content + subContent;

            console.log( JSON.stringify(jsonObj, null, "\t") + "\n");

          } catch (e) {
            console.log("解析视频失败");
          } finally {

          }

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
