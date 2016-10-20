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
  var didSetRes = false;
  try {
    buildJsonArrayByUrlArray(urls, function(jsons) {
        var content = "";
        var total = urls.length;
        for (var i = 0; i < total; i++) {
          var json = jsons[i];
          if (json != null) {
            content = content + buildHTMLByJson(json);
          }
        }
        var header = fs.readFileSync('output').toString();
        var html = "<html>" + header + "<body>" + content + "</body>" + "</html>";
        result = html;
        didSetRes = true;
        res.send(html);
    });
  } catch(e) {
    if (!didSetRes) {
      res.send(e);
    }
  } finally {
    // (result);
  }
});

router.post('/videoJson', function(req, res){
  res.contentType('json')
  var url = req.body.url;
  fetchJsonByUrl(url, function(json) {
    res.send(json);
  });
});

function buildHTMLByJson(json) {
  function tableRow(key, value) {
    return "<tr>" + "<td width='100px'><div class='data'>" + key + "</div></td>" +  "<td><div class='data'>" + value + "</div></td>" + "</tr>";
  }
  if (json.success && json.data != null) {
    var subContent = "<table class='table'>\n";
    var title = json.data.title + "<span >&nbsp; &nbsp; &nbsp;</span> <a href='" + json.data.url + "'>" + "[跳转网页]  " + "</a>";
    subContent = subContent + tableRow("标题", title);
    var image =  "<img src='"+json.data.image+"' />";
    subContent = subContent + tableRow("缩略图", image);
    var video = "<input id='videoCode' style='width:100%;height:30px;' value=\"" +  json.data.videoCode + "\"</input>";
    subContent = subContent + tableRow("通用代码", video);
    var auth = "<input id='authId' style='width:100%;height:30px;' value=\"" +  json.data.authId + "\"</input>";
    subContent = subContent + tableRow("作者" + json.data.authName, auth);
    subContent = subContent + "\n</table><br><br>";

    return subContent;
  } else {
    var subContent = "<table class='table'>\n";
    var error = json.reason + "<span >&nbsp; &nbsp; &nbsp;</span> <a href='" + json.source + "'>" + "[跳转网页]  " + "</a>";
    subContent = subContent + tableRow("失败", error);
    subContent = subContent + "\n</table><br><br>";
    return subContent;
  }

}

function buildJsonArrayByUrlArray(urls, callback) {

  var jsons = new Object();
  var length = urls.length;
  var progress = 0;
  for (var index in urls) {
    var url = urls[index];
    if (url.length == 0) {
      progress = progress + 1;
      continue;
    }
    fetchJsonByUrl(url, index, function(jsonObj, i) {
        jsons[i] = jsonObj;
        progress = progress + 1;
        if (progress == length) {
            callback(jsons);
        }
    });
  }
}

function fetchJsonByUrl(url, i, callback) {
  var userAgent = "Paw/2.3.1 (Macintosh; OS X/10.12.0) GCDHTTPRequest";
  var urlCache = url;
  var index = i;
  if (url == null || url.indexOf("http://v.youku.com") < 0) {
      callback({ success: false, source: urlCache, reason: "Invail url:" + url}, index);
      return;
  }
  superagent.get(url)
    .set("User-Agent", userAgent)
    .end(function (err, sres) {
      if (err) {
        callback({ success: false, source: urlCache, reason: err }, index);
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
                callback({ success: false, source: urlCache, reason: err }, index);
                return;
              }
              var respone = JSON.parse(sres.text);
              var realUrl = url//"http://v.youku.com/v_show/id_" + respone.data.video.encodeid + ".html";
              var videoCode = "<iframe height=498 width=510 src=\'http://player.youku.com/embed/" + respone.data.video.encodeid + "\' frameborder=0 \'allowfullscreen\'></iframe>";

              var authId = "";
              var authName = "";
              var irTitle = respone.data.video.title;
              if (irTitle.indexOf("刘哥") > 0) {
                  authId = "56c04b8518000021009d3766";
                  authName = "刘哥";
              } else if (irTitle.indexOf("评头论足") > 0) {
                  authId = "5743fa2c1700003d00e61f87";
                  authName = "谢双超";
              }

              var jsonObj = {
                success: true,
                source: urlCache,
                data: {
                  url: realUrl,
                  title: respone.data.video.title,
                  videoCode: videoCode,
                  image: respone.data.video.logo.replace("r1", "r3"),
                  authId: authId,
                  authName:  authName
                }
              };
              callback(jsonObj, index);
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
          var videoCode = "<iframe height=498 width=510 src=\'http://player.youku.com/embed/" + videoId + "\' frameborder=0 \'allowfullscreen\'></iframe>";

          var image = "";
          if ($('#s_qq_haoyou1').attr('href') != null) {
            var data = $('#s_qq_haoyou1').attr('href').split('imageUrl=');
            if (data != null && data.length > 0 ){
              image = $('#s_qq_haoyou1').attr('href').split('imageUrl=')[1].split('&')[0].replace("05420", "05410").replace("r1", "r4");
            }
          } else if ($('#share-qq').attr('href') != null) {
            var data = $('#share-qq').attr('href').split('pics=');
            if (data != null && data.length > 0 ){
              image = data[1].split('&')[0].replace("05420", "05410").replace("r1", "r4");
            }
          }

          var realUrl = "http://v.youku.com/v_show/id_" + videoId + ".html";
          var authId = "";
          var authName = "";
          if (irTitle.indexOf("刘哥") > 0) {
              authId = "56c04b8518000021009d3766";
              authName = "刘哥";
          } else if (irTitle.indexOf("评头论足") > 0) {
              authId = "5743fa2c1700003d00e61f87";
              authName = "谢双超";
          }

          var jsonObj = {
            success: true,
            source: urlCache,
            data: {
              url: url,
              title: irTitle,
              videoCode: videoCode,
              image: image,
              authId: authId,
              authName: authName
            }
          };
          callback(jsonObj, index);
        } catch (e) {
          callback({ success: false, source: urlCache, reason: err }, index);
        } finally {
        }
      }
  });
}


app.listen(4434, function () {
  console.log('App is listening at port 4434');
});
