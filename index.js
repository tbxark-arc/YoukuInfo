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
app.post('/videoJson', router);



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
          if (err) {
            if (count == 0) {
              res.send(content);
            }
            return ;
          }

          var numIdRegx = new RegExp('videoId:\"[a-zA-Z0-9=]*');
          var rs0 = numIdRegx.exec(sres.text);

          if (rs0 != null && rs0.length > 0) {
              var numId = rs0[0].replace("videoId:\"", "");
              var jsonURL = "http://play.youku.com/play/get.json?vid=" + numId + "&ct=12";
              superagent.get(jsonURL)
                .end(function(err, sres) {
                  if (err) {
                    if (count == 0) {
                      res.send(content);
                    }
                    return ;
                  }
                  var respone = JSON.parse(sres.text);
                  var realUrl = "http://v.youku.com/v_show/id_" + respone.data.video.encodeid + ".html";
                  var videoCode = "<iframe height=498 width=510 src=\'http://player.youku.com/embed/" + respone.data.video.encodeid + "\' frameborder=0 \'allowfullscreen\'></iframe>";

                  var jsonObj = {
                    url: realUrl,
                    title: respone.data.video.title,
                    videoCode: videoCode,
                    image: respone.data.video.logo.replace("r1", "r3")
                  };

                  var subContent =  "标题:" + "<br>"  + jsonObj.title + "<a href='" + jsonObj.url + "'>" + "[跳转网页]  " + "<a>"  + "<br>" + "<br>";
                  subContent = subContent + "缩略图:" + "<br>" + "<img src='"+jsonObj.image+"' />" + "<br>" + "<br>";
                  subContent = subContent + "通用代码:" + "<br>" + "<input id='videoCode' style='width:100%' value=\"" +  jsonObj.videoCode + "\"</input>" + "<br>" +"<br>" + "<br>" + "<br>";

                  content = content + subContent;

                  console.log( JSON.stringify(jsonObj, null, "\t") + "\n");

                  count = count - 1;
                  if (count == 0) {
                    res.send(content);
                  }

                });
                return;
          } else {
            try {
              var $ = cheerio.load(sres.text);
              var titleRegx = new RegExp("<title>[^<]+</title>")
              var rs1 = titleRegx.exec(sres.text);
              var videoTitle = "";
              if (rs1 != null && rs1.length > 0) {
                videoTitle = rs1[0].replace("<title>", "").replace("</title>", "").split("在线播放")[0]
              } else {
                var titleRegx2 = new RegExp("showTitle =[^;]+;");
                var rs1s =  titleRegx2.exec(sres.text);
                if (rs1s != null && rs1s.length > 0) {
                    videoTitle = rs1s[0].replace("showTitle =", "");
                }
              }

              var videoIdRegx = new RegExp("(videoId2|videoIdEn)= '[a-zA-Z0-9=]*");
              var rs2 = videoIdRegx.exec(sres.text);
              var videoId = rs2[0].replace("(videoId2|videoIdEn)= '", "");

              var irTitle =  videoTitle
              // var keywords =  $('meta[name="keywords"]').attr('content');
              var videoCode = "<iframe height=498 width=510 src=\'http://player.youku.com/embed/" + videoId + "\' frameborder=0 \'allowfullscreen\'></iframe>";

              var image = "";
              if ($('#s_qq_haoyou1').attr('href') != null) {
                var data = $('#s_qq_haoyou1').attr('href').split('imageUrl=');
                console.log("s_qq_haoyou1");
                if (data != null && data.length > 0 ){
                  console.log(data[1]);
                  image = $('#s_qq_haoyou1').attr('href').split('imageUrl=')[1].split('&')[0].replace("05420", "05410").replace("r1", "r4");
                }
              } else if ($('#share-qq').attr('href') != null) {
                console.log("share-qq");
                var data = $('#share-qq').attr('href').split('pics=');
                if (data != null && data.length > 0 ){
                  console.log(data);
                  image = data[1].split('&')[0].replace("05420", "05410").replace("r1", "r4");
                }
              }

              var realUrl = "http://v.youku.com/v_show/id_" + videoId + ".html";

              var jsonObj = {
                url: url,
                title: irTitle,
                videoCode: videoCode,
                image: image
              };

              var subContent =  "标题:" + "<br>"  + jsonObj.irTitle + "<a href='" + jsonObj.url + "'>" + "[跳转网页]  " + "<a>"  + "<br>" + "<br>";
              subContent = subContent + "缩略图:" + "<br>" + "<img src='"+jsonObj.image+"' />" + "<br>" + "<br>";
              subContent = subContent + "通用代码:" + "<br>" + "<input id='videoCode' style='width:100%' value=\"" +  jsonObj.videoCode + "\"</input>" + "<br>" +"<br>" + "<br>" + "<br>";

              content = content + subContent;

              console.log( JSON.stringify(jsonObj, null, "\t") + "\n");

            } catch (e) {
              console.log(e);
            } finally {
              count = count - 1;
              if (count == 0) {
                res.send(content);
              }
            }
          }
          });
      } else {
        console.log("不支持此URL");
        count = count - 1;
        if (count == 0) {
          res.send(content);
        }
      }
    }
});


router.post('/videoJson', function(req, res){
  res.contentType('json')
  var url = req.body.url
  var userAgent = "Paw/2.3.1 (Macintosh; OS X/10.12.0) GCDHTTPRequest"//"Mozilla/5.0 (iPad; CPU OS 10_0 like Mac OS X) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/10.0 Mobile/14A300 Safari/602.1"

  if (url.length > 0 && url.indexOf("http://v.youku.com") >= 0) {

    superagent.get(url)
      .set("User-Agent", userAgent)
      .end(function (err, sres) {
        if (err) {
          res.send(err);
          return ;
        }

        var numIdRegx = new RegExp('videoId:\"[a-zA-Z0-9=]*');
        var rs0 = numIdRegx.exec(sres.text);

        if (rs0 != null && rs0.length > 0) {
            var numId = rs0[0].replace("videoId:\"", "");
            var jsonURL = "http://play.youku.com/play/get.json?vid=" + numId + "&ct=12";
            superagent.get(jsonURL)
              .end(function(err, sres) {
                if (err) {
                  res.send({
                    success: false,
                    reason: err
                  });
                  return;
                }
                var respone = JSON.parse(sres.text);
                var realUrl = "http://v.youku.com/v_show/id_" + respone.data.video.encodeid + ".html";
                var videoCode = "<iframe height=498 width=510 src=\'http://player.youku.com/embed/" + respone.data.video.encodeid + "\' frameborder=0 \'allowfullscreen\'></iframe>";

                var jsonObj = {
                  success: true,
                  data: {
                    url: realUrl,
                    title: respone.data.video.title,
                    videoCode: videoCode,
                    image: respone.data.video.logo
                  }
                };

                console.log( JSON.stringify(jsonObj, null, "\t") + "\n");
                res.send(JSON.stringify(jsonObj, null, "") + "\n");
              });
              return;
        } else {
          try {
            var $ = cheerio.load(sres.text);
            var titleRegx = new RegExp("<title>[^<]+</title>")
            var rs1 = titleRegx.exec(sres.text);
            var videoTitle = "";
            if (rs1 != null && rs1.length > 0) {
              videoTitle = rs1[0].replace("<title>", "").replace("</title>", "").split("在线播放")[0]
            } else {
              var titleRegx2 = new RegExp("showTitle =[^;]+;");
              var rs1s =  titleRegx2.exec(sres.text);
              if (rs1s != null && rs1s.length > 0) {
                  videoTitle = rs1s[0].replace("showTitle =", "");
              }
            }

            var videoIdRegx = new RegExp("(videoId2|videoIdEn)= '[a-zA-Z0-9=]*");
            var rs2 = videoIdRegx.exec(sres.text);
            var videoId = rs2[0].replace("(videoId2|videoIdEn)= '", "");

            var irTitle =  videoTitle
            // var keywords =  $('meta[name="keywords"]').attr('content');
            var videoCode = "<iframe height=498 width=510 src=\'http://player.youku.com/embed/" + videoId + "\' frameborder=0 \'allowfullscreen\'></iframe>";

            var image = "";
            if ($('#s_qq_haoyou1').attr('href') != null) {
              var data = $('#s_qq_haoyou1').attr('href').split('imageUrl=');
              console.log("s_qq_haoyou1");
              if (data != null && data.length > 0 ){
                console.log(data[1]);
                image = $('#s_qq_haoyou1').attr('href').split('imageUrl=')[1].split('&')[0].replace("05420", "05410").replace("r1", "r4");
              }
            } else if ($('#share-qq').attr('href') != null) {
              console.log("share-qq");
              var data = $('#share-qq').attr('href').split('pics=');
              if (data != null && data.length > 0 ){
                console.log(data);
                image = data[1].split('&')[0].replace("05420", "05410").replace("r1", "r4");
              }
            }

            var realUrl = "http://v.youku.com/v_show/id_" + videoId + ".html";

            var jsonObj = {
              success: true,
              data: {
                url: url,
                title: irTitle,
                videoCode: videoCode,
                image: image
              }
            };

            console.log( JSON.stringify(jsonObj, null, "\t") + "\n");
            res.send(JSON.stringify(jsonObj, null, "") + "\n");
          } catch (e) {
            res.send({
              success: false,
              reason: err
            });
          } finally {
          }
        }
        });
    } else {
      res.send({
        success: false,
        reason: err
      });
    }
});


app.listen(4433, function () {
  console.log('App is listening at port 4433');
});
