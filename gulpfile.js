//利用するプラグイン
var gulp = require("gulp");
var fs = require('fs');
var concat = require("gulp-concat"); //結合
var foreach = require('gulp-foreach'); //フォルダごとの処理を行うために
var header = require('gulp-header');
var gulpif = require('gulp-if');
var order = require("gulp-order");
var countStat = require("gulp-count-stat");
var gap = require('gulp-append-prepend');//ファイル結合
//https://www.npmjs.com/package/gulp-append-prepend
var folderspath = ['Draft/*/'];

var del = require('del');// 削除コマンド
var sectionstar = `\n\n　　　＊\n\n`;

gulp.task('cleaning', function(){
    return del('tmp/**');
});

gulp.task('chapter', function(){
    var totalSectionNumber = -1;
    var chapterNumber = 0;
    console.log("フォルダーのパス",folderspath);
    toc('init', '','');
    return gulp.src(folderspath)
        .pipe(order([
            '*/'
        ]))
        .pipe(foreach(function(stream, chapter){
            chapterNumber ++;
            var chapterZeroPadding = ("000" + chapterNumber).slice( -3 );
            var sectionPath = chapter.path + '/*/';
            var sectionPath = chapter.path + '/';
            //var filesPath = chapter.path + '/*/*.txt';
            var chaptername = chapter.basename;
            //var chapterNameOfWork = "<h2>" + chaptername.replace(/[0-9]\s/,'') + "</h2>\n";
            var chapterNameOfWork = `<h2 id='ch-${chapterNumber}'>${chaptername.replace(/[0-9]+\s*/,'') }</h2>\n`;
            var chapterTextFilePath = 'tmp/' + chapterZeroPadding + '-' + chaptername +'.txt';
            fs.writeFileSync(chapterTextFilePath, chapterNameOfWork);
            // 目次に章番号を追加
            toc(chaptername.replace(/[0-9]+\s*/,'') ,  `ch-${chapterNumber}`, 'chapter');

            console.log('章:',chapter.basename, chapter.path, 'chapter');

            var numberOfSection = 0;
            return gulp.src(sectionPath)
                .pipe(order([
                    '*/'
                ]))
                .pipe(foreach(function(stream, section){
                    numberOfSection ++;
                    totalSectionNumber ++;
                    var indexInSection = 0;
                    var filesPath = section.path + '/*.txt';
                    console.log("節:", section.path);
                    return gulp.src(filesPath)
                        .pipe(foreach(function(stream, file){
                            indexInSection ++;
                            console.log("テキスト", chapterNumber, numberOfSection, indexInSection, file.path);
                            var appendText = '';
                            if(totalSectionNumber >= 1 && indexInSection == 1) {
                                //セクション用の見出し
                                appendText += `\n<h3 id='sec-${totalSectionNumber}'><span class='tcy'>${totalSectionNumber}</span></h3>\n`;
                                toc( `<span class='tcy'>${totalSectionNumber}</span>`,  `sec-${totalSectionNumber}`, 'section');
                            }
                            if(indexInSection >= 2) {
                                appendText += '\n';
                            }
                            appendText += fs.readFileSync(file.path, 'utf8');
                            
                            fs.appendFileSync( chapterTextFilePath, appendText);
                            
                            return gulp.src(chapterTextFilePath)
                                .pipe(gulp.dest('tmp/'));
                            
                        }));
                }));
        }));
});

function toc( tocIndex, tocAnchor, tocClass ){
    var tocPath = 'tmp/toc.html';
    var appendText = `                      <li class=${tocClass}><a href='#${tocAnchor}'>${tocIndex}</a>\n`;
     if(tocIndex == 'init'){
         appendText =     `<nav id="toc"> 
         <h2>目次</h2>
         <ul>\n`
     }
     if(tocIndex == 'eof'){
        appendText =`       </ul>
</nav>`
    }
    fs.appendFileSync( tocPath, appendText);
    return;
}

gulp.task('novel', function(){
    toc('eof','', '');
    return gulp.src('tmp/*.txt')
        .pipe(order([
            'tmp/*.txt'
        ]))
        .pipe(concat('novel.txt'))
        .pipe(gulp.dest('publish/'));
});

gulp.task('countstat', function(){
    return gulp.src( 'tmp/*.txt' )
        .pipe(countStat({ words: false, showDir: false }));
});

gulp.task('watch', function(){
    gulp.watch(
        ['Draft/**/', 'Draft/**/*.txt'],
        gulp.series('cleaning', 'chapter', 'countstat', 'novel')
    );
});

gulp.task('build', gulp.series('cleaning', 'chapter', 'countstat', 'novel', function(done){done()}));


gulp.task('default', gulp.task('watch'));
