const fs = require("fs");

var publishingHTML = '';
var tocHTML = '';

fs.readFile("tmp/toc.html", "utf-8", (err, data) => {
    if (err) throw err;
    //    console.log(data);
    tocHTML = data;
    console.log("目次取得完了");
  });

fs.readFile("publish/novel.txt", "utf-8", (err, data) => {
    if (err) throw err;
//    console.log(data);
    publishingHTML = buildHtml(data);
    fs.writeFile("publish/buildHtml.html",publishingHTML,function(err){
        if(err) throw err;
        console.log("HTML書き込み完了");
     });
});

const packageFile = fs.readFileSync("package.json", "utf-8");
const package = JSON.parse(packageFile)

function contentHTML(compiledText) {
    let myHTML = "";

    const paragraphs = compiledText.split('\n');
    paragraphs.forEach(paragraph => {
        if (paragraph.match(/^\s*$/)) {
            myHTML += '<p class="blank">_' + paragraph + '</p>\n';
        } else if(paragraph.match(/^\s*<h.+$/)){
          myHTML += paragraph + '\n';
        } else {
            myHTML += '<p>' + paragraph + '</p>\n';
        }
    });
    return markUpHTML(myHTML);
}
function markUpHTML( string ){
    let taggedHTML = string;
    
    var userRegex = [];
    if (userRegex.length > 0){
        userRegex.forEach( function(element){
                const thisMatch = new RegExp(element[0], 'gi');
                const thisReplace = element[1];
                taggedHTML = taggedHTML.replace(thisMatch, thisReplace);
        });
    }

    taggedHTML = taggedHTML.replace(/(?<![0-9a-zA-Z\-])([0-9][0-9])(?![0-9a-zA-Z\-])/g, '<span class="tcy">$1</span>');
    taggedHTML = taggedHTML.replace(/<p>［＃ここから[１1一]文字下げ］<\/p>/g, '<div class="indent-1">');
    taggedHTML = taggedHTML.replace(/<p>［＃ここから[２2二]文字下げ］<\/p>/g, '<div class="indent-2">');
    taggedHTML = taggedHTML.replace(/<p>［＃ここから[３3三]文字下げ］<\/p>/g, '<div class="indent-3">');
    taggedHTML = taggedHTML.replace(/<p>［＃ここで字下げ終わり］<\/p>/g, '</div>');
    taggedHTML = taggedHTML.replace(/<!-- (.+?) -->/g, '<span class="comment"><span class="commentbody">$1</span></span>');
    taggedHTML = taggedHTML.replace(/｜([^｜\n]+?)《([^《]+?)》/g, '<ruby>$1<rt>$2</rt></ruby>');
    taggedHTML = taggedHTML.replace(/([一-鿏々-〇]+?)《(.+?)》/g, '<ruby>$1<rt>$2</rt></ruby>');
    taggedHTML = taggedHTML.replace(/(.+?)［＃「\1」に傍点］/g, '<em class="side-dot">$1</em>');

    return taggedHTML;
}


function buildHtml(string) {
    //configuration 読み込み
        let lineHeightRate = 1.75;
        let fontFamily = 'Sawarabi Mincho';
        let fontSize = '10.5q';
        let numfontSize = 10.5;
        let unitoffontSize = 'q';

        let lineLength = 40;
        let linesPerPage = 18;

        let pageWidth = ( linesPerPage * numfontSize * lineHeightRate + (numfontSize * 0.7) ) + unitoffontSize;
        let pageHeight = (lineLength * numfontSize) + unitoffontSize;
        let lineHeight = ( numfontSize * lineHeightRate) + unitoffontSize;

        let bookTitle = package.title;
        let bookAuthor = package.author;
        let projectTitle = package.name;

    const myText = contentHTML(string);
    return `<!DOCTYPE html>
  <html lang="ja">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css?family=Sawarabi+Mincho" rel="stylesheet">
      <title>${projectTitle}</title>

      <style>
      @charset "UTF-8";
      html {
      /* 組み方向 */
      -epub-writing-mode: vertical-rl;
      -ms-writing-mode: tb-rl;
      writing-mode: vertical-rl;
      font-family: Hiragino Mincho Pro;
      orphans: 1;
      widows: 1;
      }
  
      * {
      margin: 0;
      padding: 0;
      }
  
      @page {
      size: 105mm 148mm;
      width: ${pageWidth};
      height: ${pageHeight};
      /*  width: calc(84mm - 1q); */
      /*height: 110mm;*/
      margin-top: 20mm;
      margin-bottom: auto;
      margin-left: auto;
      margin-right: auto;
      /* 以下、マージンボックスに継承される */
      font-size: 6pt;
      /* 本来不要（<span class="smaller"><span class="smaller">ルート要素の指定が継承される</span></span>）だが、現時点のvivliostyle.jsの制限により必要 */
      vertical-align: top;
      }
  
      @page :left {
      margin-left: 10mm;
        @top-left {
            content: counter(page) "  ${bookTitle}";
            margin-left: 12q;
            margin-top: 135mm;
            writing-mode: horizontal-tb;
            /* CSS仕様上は@pageルール内に書けばよいが、現時点のvivliostyle.jsの制限によりここに書く */
        }
      }
      @page :right {
      margin-right: 10mm;
        /* 右下ノンブル */
        @top-right {
            content: "${bookTitle}  "counter(page);
            margin-right: 12q;
            margin-top: 135mm;
            writing-mode: horizontal-tb;
            /* CSS仕様上は@pageルール内に書けばよいが、現時点のvivliostyle.jsの制限によりここに書く */
        }
      }
  
      html {
      font-weight: Medium;
      text-align: justify;
      }
  
      body{
      }

      /* ノンブル追加 */
        nav li{
        display: block;
        }

        nav li a{
        display: flex;
        order: 0;
        text-decoration: none;
        color: black;
        font-size: calc(110mm / 40);
        }

        nav li.section{
          padding-top: 2em;
        }

        nav li a::before{
        display:flexbox;
        flex-grow: 1;
        order: 1;
        border-left: 1pt dotted black;
        content:" ";
        width: 1pt;
        margin-right: calc(110mm / 40 * 0.6 - 0.5pt) ;
        margin-top: 0.5em;
        }

        nav li a::after {
        display: flexbox;
        order: 2;
        height: 1em;
        text-align: right;
        content: target-counter(attr(href), page);	
        align-self: flex-end;
        font-size:0.85;
        text-combine: horizontal;
        }

      h1 {
      /* フォント */
      font-weight: Extrabold;
      /* フォントサイズ */
      font-size: 24q;
      /* 字下げ */
      text-indent: 0;
      /* 直後の改ページ・改段禁止 */
      page-break-before: always;
      page-break-after: always;
      line-height: 42q;
      letter-spacing: 0.25em;
      display: block;
      align-items: center;
      padding-top:1.5em;
      }


    h1 span.author {
        display:block;
        margin-bottom: 1em;
    }
  
      h2 {
      /* フォント */
      font-weight: Demibold;
      /* フォントサイズ */
      font-size: 16q;
      /* 字下げ */
      text-indent: 3em;
      /* 直後の改ページ・改段禁止 */
      page-break-before: always;
      page-break-after: avoid;
      line-height: 42q;
      margin-left: 2em;
      }
  
      h2.part {
      width: 80mm;
      padding: 0mm 35mm;
      font-weight: bold;
      font-size: 16q;
      page-break-before: always;
      page-break-after: always;
      margin-left: 4em;
      }
  
      h1 + h2 {
      margin-right: 16pt;
      }
  
      h3{
          font-size:1em;
          font-size: calc(110mm / ${lineLength});
          margin: 3em calc(110mm / ${lineLength} * ${lineHeightRate}) 0 calc(110mm / ${lineLength} * ${lineHeightRate});
        }

      ruby > rt {
      font-size: 6.5q;
      }
  
      p {
        font-size: calc(110mm / ${lineLength});
        line-height: ${lineHeightRate};
        text-indent: 0em;
        hanging-punctuation: force-end;
        line-break:strict;
        page-break-inside: auto;
    }
 
      div.indent-1 p:first-of-type, div.indent-2 p:first-of-type, div.indent-3 p:first-of-type{
        padding-block-start: calc( ${fontSize} * ${lineHeightRate});
        }

        div.indent-1 p:last-of-type, div.indent-2 p:last-of-type, div.indent-3 p:last-of-type{
        padding-block-end: calc( ${fontSize} * ${lineHeightRate});
        }

    
    div.indent-1 p{
    height: calc( 110mm - (${fontSize}));
    padding-top: ${fontSize};
    }

    div.indent-2 p{
    height: calc( 110mm - (${fontSize} * 2));
    padding-top: calc(${fontSize} * 2);
    }

    div.indent-3 p{
    height: calc( 110mm - (${fontSize} * 3));
    padding-top: calc(${fontSize} * 3);
    }

        p.goth {
        margin-top: 3em;
        margin-block-start: 1em;
        margin-block-end: 1em;
        }
  
        p.align-rb {
        text-align: right;
        }

        p.goth + p.goth {
        margin-block-start: -1em;
        }

        div.codes {
        display: inline-block;
        margin: 3em 1em;
        writing-mode: horizontal-tb;
        padding: 1em;
        font-family: "Courier", monospace;
        font-size: 0.8em;
        }
  
      div.codes p {
      text-orientation: sideways;
      }
  
      p.star {
      text-indent: 3em;
      margin-right: 16pt;
      margin-left: 16pt;
      }
  
      hr {
      border: none;
      border-right: 1pt solid black;
      height: 6em;
      margin: auto 8.5pt;
      }
  
      /* 縦中横 */
      .tcy {
      -webkit-text-combine: horizontal;
      text-combine: horizontal;
      -ms-text-combine-horizontal: all;
      text-combine-horizontal: digit 2;
      text-combine-upright: digit 2;
      }
  
      /* 圏点（<span class="smaller">ゴマ</span>） */
      em.side-dot, em.sesame_dot {
      font-style: normal;
      -webkit-text-emphasis-style: sesame;
      text-emphasis-style: sesame;
      }
  
      /*著作者*/
      .author {
      position: absolute;
      bottom: 0;
      font-size: 8.5pt;
      margin-top: 50pt;
      letter-spacing: normal;
      }
  
      /*画像＋キャプション*/
      figure {
      display: block;
      width: 236pt;
      -ms-writing-mode: lr-tb;
      -webkit-writing-mode: horizontal-tb;
      writing-mode: horizontal-tb;
      }
  
      figure img {
      width: 100%;
      height: auto;
      vertical-align: bottom;
      }
  
      figcaption {
      text-align: left;
      font-size: 7pt;
      }
  
      /*奥付*/
      .colophon {
      font-size: 7pt;
      margin-right: 48pt;
      }
      /* 級さげ */
      span.smaller{
          font-size:6.5pt
      }
  
    div.comment {
        display:none;
    }

    p.blank {
        color:transparent;
    }

        </style>
      <link rel="stylesheet" href="">
  </head>
  <body>
  <h1>${bookTitle}<span class="author">${bookAuthor}</span></h1>
  ${tocHTML}
  
  ${myText}
  
  </body>
  </html>`;
  }
