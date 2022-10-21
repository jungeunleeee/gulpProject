/*
 진도 순서
 1. html & ejs & scss & js & images & svg & fonts 만들고 소스 변경되면 dist 폴더에 자동 배포되게 셋팅 [watch]
 2. 가상서버로 브라우저 화면 띄우기 -> 소스 변경시 자동 배포 되고 브라우저 자동 새로 고침하여 반영하기 [browserSync]
 3. 깃허브에 배포하고 깃허브 페이지 연결
 */

const gulp                      = require('gulp'),
      scss                      = require('gulp-sass')(require('sass')),  //gulp-sass는 node-sass 기반으로 만들어진 플러그인
      sourcemaps                = require('gulp-sourcemaps'), // 컴파일 된 CSS 에 원본소스의 위치와 줄수 주석표시
      ejs                       = require('gulp-ejs'), // ejs 확장자 파일 사용
      concat                    = require('gulp-concat'), // 파일을 하나의 파일로 압축
      uglify                    = require('gulp-uglify'), // 자바스크립트 코드를 압축해 용량을 줄임
      rename                    = require('gulp-rename'), // 파일의 이름을 변경
      deploy                    = require('gulp-gh-pages'), // 깃허브 페이지
      browserSync               = require('browser-sync').create(); // 서버생성

var SRC_FOLDER = './src';
var DIST_FOLDER = './dist';

var SRC_PATH = {    
    ASSETS:  {
        FONTS:      './src/assets/fonts'
        , IMAGES:   './src/assets/images'
        , SCSS:    './src/assets/scss'
        , JS:    './src/assets/js'
    },
    EJS: './src/ejs'  
},

DEST_PATH = {
    ASSETS: {
        FONTS:      './dist/assets/fonts'
        , IMAGES:   './dist/assets/images'
        , CSS:    './dist/assets/css'
        , JS:    './dist/assets/js'
    }
},

// 옵션
OPTIONS = {
    outputStyle: "expanded" // CSS의 컴파일 결과 코드스타일 지정 nested, expanded, compact, compressed
    , indentType: "space" //  컴파일 된 CSS의 "들여쓰기" 의 타입 space, tab
    , indentWidth: 4 // 컴파일 된 CSS의 "들여쓰기" 의 갯수 
    , precision: 8 // 컴파일 된 CSS 의 소수점 자리수
    //, sourceComments: true // 컴파일 된 CSS 에 원본소스의 위치와 줄수 주석표시, 기존 sourcemaps 사용시 따로 작성 안해도 됨
};

/*task 기능 설명
gulp.task(name, deps, func)

gulp.task() 는 Gulp 가 수행할 일을 정의하고, 이 메소드는 세 개의 전달인자를 받습니다.
그리고 3개의 파라미터 중에 두번째 파라미터는 생략할 수 있습니다.

예시)
gulp.task('combine:js', ['lint-js'], function () {
    return gulp.src(PATH.ASSETS.SCSS + '/*.scss')
    .pipe(concat('scriptAll.js'))
    .pipe(gulp.dest( DEST_PATH.ASSETS.SCSS ));
});

1) name - task의 이름을 지정하고, 이름에는 공백이 포함되어서는 안됩니다.
2) deps - 현재 선언하고 있는 task를 수행하기 전에 먼저 실행되어야하는 task들의 배열 목록을 작성할 수 있습니다.
위의 예제에서는 JavaScript 파일을 병합하는 task를 진행하기 전에 JavaScript Lint(자바스크립트 문법 검사)를 먼저 수행하도록 정의되어 있습니다.
(물론 그 전에 lint-js task를 이 task보다 앞에 작성해주어야 먼저 수행할 수 있을 것입니다.)
3) func - 실제 수행할 업무 프로세스를 정의하는 function 입니다.(처리해야할 일을 정의)
*/

gulp.task('html', function () {
    return gulp
    .src( SRC_FOLDER + '/**/*.html' )
    .pipe(gulp.dest( DIST_FOLDER ))    
    .pipe(browserSync.stream()); //.pipe(browserSync.reload({stream : true})); 와 같음, 파일이 재 배포되면 자동으로 새로고침하여 브라우저에 반영
});

gulp.task('ejs', function () {
    return gulp
    .src( SRC_FOLDER + '/ejs/**/!(_)*.ejs' )
    .pipe(ejs())
	.pipe(rename({ extname: '.html' })) // ejs 확장자를 html로 변경
    .pipe(gulp.dest( DIST_FOLDER ))
    .pipe(browserSync.stream());
});

gulp.task( 'scss:compile', function () {    
    return gulp
    .src( SRC_PATH.ASSETS.SCSS + '/*.scss' )
    .pipe( sourcemaps.init() )
    .pipe( scss(OPTIONS) )
    .pipe( sourcemaps.write() )
    .pipe( gulp.dest( DEST_PATH.ASSETS.CSS ) )
    .pipe(browserSync.stream());
});

gulp.task('js', () => {
	return gulp
    .src( SRC_PATH.ASSETS.JS + '/*.js' )
    .pipe(sourcemaps.init())    
    .pipe(concat('all.js'))
    .pipe(sourcemaps.write())
	.pipe(gulp.dest( DEST_PATH.ASSETS.JS ))
	.pipe(browserSync.stream());
});

gulp.task('images', () => {
    return gulp
    .src( SRC_PATH.ASSETS.IMAGES + '/**/*.+(png|jpg|jpeg|gif|ico)' )
    .pipe(gulp.dest( DEST_PATH.ASSETS.IMAGES ))
    .pipe(browserSync.stream());
});

gulp.task('svg', () => {
    return gulp
    .src(SRC_PATH.ASSETS.IMAGES + '/**/*.svg')
    .pipe(gulp.dest( DEST_PATH.ASSETS.IMAGES ))
    .pipe(browserSync.stream());
});

gulp.task('fonts', () => {
    return gulp
    .src(SRC_PATH.ASSETS.FONTS + '/**/*.+(eot|otf|svg|ttf|woff|woff2)')
    .pipe(gulp.dest( DEST_PATH.ASSETS.FONTS ))
    .pipe(browserSync.stream());
});

// 파일 감시하다가 변경되면 바로 재 배포
gulp.task( 'watch', function () {     
    gulp.watch( SRC_FOLDER + '/**/*.html', gulp.series('html'));       
    gulp.watch( SRC_PATH.EJS + '/**/*.ejs', gulp.series('ejs'));        
    gulp.watch( SRC_PATH.ASSETS.SCSS + '/*.scss', gulp.series('scss:compile')); 
    gulp.watch( SRC_PATH.ASSETS.JS + '/*.js', gulp.series('js')); 
    gulp.watch( SRC_PATH.ASSETS.IMAGES + '/**/*.+(png|jpg|jpeg|gif|ico)', gulp.series('images')); 
    gulp.watch( SRC_PATH.ASSETS.IMAGES + '/**/*.svg', gulp.series('svg')); 
    gulp.watch( SRC_PATH.ASSETS.FONTS + '/**/*.+(eot|otf|svg|ttf|woff|woff2)', gulp.series('fonts')); 
});

// 가상 서버 띄우기 
gulp.task('browserSync', function() {
    browserSync.init({
      server: {
        baseDir: [ 'dist' ],
        port: 3000,
        open: true
      }
    });
});

gulp.task('build', gulp.series('html','ejs','scss:compile','js','images','svg','fonts', gulp.parallel('browserSync', 'watch')));
gulp.task('default', gulp.series('build', gulp.parallel('browserSync', 'watch')));


/**
 * Push build to gh-pages
 */
gulp.task('deploy', function () {
    return gulp.src("./dist/**/*")
        .pipe(deploy())
});