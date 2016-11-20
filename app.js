var superagent = require('superagent');
var express = require('express');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
var fs = require("fs");


var port = (process.env.VCAP_APP_PORT || 4434);
var host = (process.env.VCAP_APP_HOST || 'localhost');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
var router = express.Router();

app.get('/', router);
app.post('/showdetail', router);
app.post('/videoJson', router);

router.get('/', function(req, res){
  let htmlCode =  fs.readFileSync('input.html').toString();
  res.send(htmlCode);
});

router.post('/showdetail', function(req, res){
  let urls = req.body.urls.split("\n");
  let didSetRes = false;
  try {
    buildJsonArrayByUrlArray(urls, function(jsons) {
        let content = "";
        let total = urls.length;
        for (let i = 0; i < total; i++) {
          let json = jsons[i];
          if (json != null) {
            content = content + buildHTMLByJson(json, i);
          }
        }
        let header = fs.readFileSync('output.html').toString();
        let jsCode = `
        <script>
          var clipboard = new Clipboard('.btn');
          clipboard.on('success', function(e) {
               console.log(e);
          });
          clipboard.on('error', function(e) {
               console.log(e);
          });
        </script>`;
        let html = `<html>${header}<body>${content}</body>${jsCode}</html>"`;
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
  let url = req.body.url;
  fetchJsonByUrl(url, function(json) {
    res.send(json);
  });
});




function buildHTMLByJson(json, id) {
  function tableRow(key, value) {
    return `
    <tr>
      <td width='100px'>
        <div class='data'>${key}</div>
      </td>
      <td>
        <div class='data'>${value}</div>
      </td>
    </tr>`;
  }
  if (json.success && json.data != null) {
    let openJs = `window.open('${json.data.url}')`;
    let title = `
      <input id='${'title' + id}' class='sinput' value='${json.data.title}'</input>
      <span >&nbsp; &nbsp; &nbsp;</span>
      <button onclick='"+ openJs + "'> 跳转网页 </button>
      <button class='btn' data-clipboard-target='#${'title' + id}'>复制</button>
    `;
    let keywords = `<input class='liput' value='${json.data.keywords}'</input>`;


    let videoId = "videoCode" + id;
    let video = "<input id='" + videoId + "' class='liput' value=\"" +  json.data.videoCode + "\"</input>";
    video = video + "<span >&nbsp; &nbsp; &nbsp;</span><button class='btn' data-clipboard-target='#" + videoId + "'>复制</button>";


    let auth = `
      <input id='${"authId" + id}' class='liput' value='${json.data.authId}'</input>
      <span >&nbsp; &nbsp; &nbsp;</span>
      <button class='btn' data-clipboard-target='#${"authId" + id}'>复制</button>
    `;

    let saveJs = `window.downloadFile(${json.data.image})`;
    let closeJs = `document.getElementById(${'table' + id}).hidden = true;`;
    let image =  `
      <img src='${json.data.image}' />
      <span >&nbsp; &nbsp; &nbsp;</span>
      <button onclick='${saveJs}'> 下载</button>
      <span >&nbsp; &nbsp; &nbsp;</span>
      <button onclick='${closeJs}'> 关闭</button>
    `;

    title = tableRow("标题", title);
    keywords = tableRow("关键词", keywords)
    video= tableRow("通用代码", video)
    auth = tableRow(json.data.authName, auth)
    image = tableRow("缩略图", image)


    let tableContent =  `
      <table class='table' id='${'table' + id}'>
        ${title}
        ${keywords}
        ${auth}
        ${video}
        ${image}
      </table>
      <br><br>
    `;
    return tableContent;
  } else {
    let error = `${json.reason} <span >&nbsp; &nbsp; &nbsp;</span> <a href='${json.source}'>" + "[跳转网页]  " + "</a>`;
    let subContent = `
        <table class='table'>
        ${tableRow("失败", error)}
        /table>
        <br><br>
      `;
    return subContent;
  }

}

function buildJsonArrayByUrlArray(urls, callback) {

  let jsons = new Object();
  let length = urls.length;
  let progress = 0;
  for (let index in urls) {
    let url = urls[index];
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


function getAuthId(title) {
  if (title.indexOf("刘哥") > 0) {
      const id = "56c04b8518000021009d3766";
      const name = "刘哥";
      return {id:id, name: name};
  } else if (title.indexOf("评头论足") > 0) {
      const id = "5743fa2c1700003d00e61f87";
      const name = "谢双超";
      return {id:id, name: name};
  } else if (title.indexOf("虾米") > 0 ) {
      const id = "582052a11d00000f00d6ec17";
      const name = "虾米大模王";
      return {id:id, name: name};
  } else {
      return {id: "", name: ""};
  }
}


function fetchJsonByUrl(url, i, callback) {
  const userAgent = "Paw/2.3.1 (Macintosh; OS X/10.12.0) GCDHTTPRequest";
  const urlCache = url;
  const index = i;
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

      let numIdRegx = new RegExp('videoId:\"[a-zA-Z0-9=]*');
      let rs0 = numIdRegx.exec(sres.text);
      console.log("Get video id" + rs0);
      if (rs0 != null && rs0.length > 0) {
          let numId = rs0[0].replace("videoId:\"", "");
          let jsonURL = "http://play.youku.com/play/get.json?vid=" + numId + "&ct=12";
          superagent.get(jsonURL)
            .end(function(err, sres) {
              if (err) {
                callback({ success: false, source: urlCache, reason: err }, index);
                return;
              }
              let respone = JSON.parse(sres.text);
              let realUrl = url//"http://v.youku.com/v_show/id_" + respone.data.video.encodeid + ".html";
              let videoCode = `<iframe height=498 width=510 src='${'http://player.youku.com/embed/' + respone.data.video.encodeid}' frameborder=0 'allowfullscreen'></iframe>`;

              let irTitle = respone.data.video.title;
              let youkuUserId = respone.data.video.userid;
              let auth = {};
              if ( youkuUserId == "4252709") {
                auth = {id:"5743fa2c1700003d00e61f87", name: "谢双超"};
              } else if (youkuUserId  == "87726096") {
                auth = {id:"56c04b8518000021009d3766", name: "刘哥"};
              } else if ( youkuUserId == "985159227") {
                auth = {id:"582052a11d00000f00d6ec17", name: "虾米大模王"};
              } else {
                auth = {id: "", name: ""}
              }

              var jsonObj = {
                success: true,
                source: urlCache,
                data: {
                  url: realUrl,
                  title: respone.data.video.title,
                  videoCode: videoCode,
                  image: respone.data.video.logo.replace("r1", "r3"),
                  authId: auth.id,
                  authName:  auth.name,
                  keywords:  respone.data.video.tags
                }
              };
              callback(jsonObj, index);
            });
            return;
      } else {
        try {
          let $ = cheerio.load(sres.text);
          let titleRegx = new RegExp("<title>[^<]+</title>")
          let rs1 = titleRegx.exec(sres.text);
          let videoTitle = "";
          if (rs1 != null && rs1.length > 0) {
            videoTitle = rs1[0].replace("<title>", "").replace("</title>", "").split("在线播放")[0]
          } else {
            let titleRegx2 = new RegExp("showTitle =[^;]+;");
            let rs1s =  titleRegx2.exec(sres.text);
            if (rs1s != null && rs1s.length > 0) {
                videoTitle = rs1s[0].replace("showTitle =", "");
            }
          }

          let videoIdRegx = new RegExp("(videoId2|videoIdEn)= '[a-zA-Z0-9=]*");
          let rs2 = videoIdRegx.exec(sres.text);
          let videoId = rs2[0].replace("(videoId2|videoIdEn)= '", "");

          let irTitle =  videoTitle
          let videoCode = `<iframe height=498 width=510 src='${'http://player.youku.com/embed/' + videoId}' frameborder=0 'allowfullscreen'></iframe>`;

          let image = "";
          if ($('#s_qq_haoyou1').attr('href') != null) {
            let data = $('#s_qq_haoyou1').attr('href').split('imageUrl=');
            if (data != null && data.length > 0 ){
              image = $('#s_qq_haoyou1').attr('href').split('imageUrl=')[1].split('&')[0].replace("05420", "05410").replace("r1", "r4");
            }
          } else if ($('#share-qq').attr('href') != null) {
            let data = $('#share-qq').attr('href').split('pics=');
            if (data != null && data.length > 0 ){
              image = data[1].split('&')[0].replace("05420", "05410").replace("r1", "r4");
            }
          }

          let realUrl = "http://v.youku.com/v_show/id_" + videoId + ".html";
          let auth = getAuthId(irTitle);
          if (auth.id == "" && sres.text.indexOf("评头论足") > 0) {
            auth = {id:"5743fa2c1700003d00e61f87", name: "谢双超"};
          }

          let jsonObj = {
            success: true,
            source: urlCache,
            data: {
              url: url,
              title: irTitle,
              videoCode: videoCode,
              image: image,
              authId: auth.id,
              authName: auth.name,
              tags: "没有(笑!)"
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


app.listen(port, host);
