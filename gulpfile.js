let gulp = require('gulp');
let sass = require('gulp-sass');
let browserSync = require('browser-sync').create();
// let concat = require('gulp-concat');
let responsive=require('gulp-responsive-images');

/* ---------Development tasks------------- */

gulp.task('sass', () => {
   return gulp.src('./src/sass/css/*.scss')
        .pipe(sass() .on("error", sass.logError))
        .pipe(gulp.dest('./src/css/'))
});

// Compress images from src/img folder for responsive images
// Compressed images are generated in src/img/comp folder


gulp.task('compress',()=>{
return gulp.src('./src/img/*.jpg')
.pipe(responsive({
    '*.jpg':[{
    width:500,
    quality:30,
    rename:{suffix:'-medium'}
    },{
    width:1600,
    quality:50,
    rename:{suffix:'-large'}
    },{   width:400,
        quality:20,
        rename:{suffix:'-small'}
    }]
    
    }))
    .pipe(gulp.dest('./src/img/comp/'));
})

//Default task to start server at desired port using browser sync.

gulp.task('dev',['compress','sass'],(done)=>{
  done()
});


/* -----------Production tasks------------ */



// gulp.task('copy-sw-manifest',()=>{
// return gulp.src(['./src/sw.js','./src/manifest.json'])
// .pipe(gulp.dest('./dist/'))


// })
// gulp.task('copy-imgs', () => {
//     return  gulp.src('./src/img/**')
//             .pipe(gulp.dest('./dist/img'));
//     })

// gulp.task('img-comp',()=>{
// return gulp.src('./dist/img/*.jpg')

// .pipe(responsive({
// '*.jpg':[{
// width:800,
// quality:40,
// rename:{suffix:'-medium'}
// },{
// width:1600,
// quality:60,
// rename:{suffix:'-large'}
// },{
//     width:600,
//     quality:30,
//     rename:{suffix:'-small'}
// }]

// }))
// .pipe(gulp.dest('./dist/img/comp/'));

// })

// gulp.task('test',()=>{

// return gulp.src('./tests/dbhelper.js')
// .pipe(jasmine({
// integration:false,
// vendor:'./js/**/*.js'

// }))

// });

// gulp.task('copy-html', () => {
//   return  gulp.src('./src/*.html')
//         .pipe(gulp.dest('./dist'));
// })



// gulp.task('copy-js', () => {

//    return gulp.src('./src/js/*.js')
//         .pipe(gulp.dest('./dist/js'));

// })
// gulp.task('sass', () => {
//    return gulp.src('./src/sass/**/*.scss')
//         .pipe(sass())
//         .pipe(gulp.dest('./dist'))
//         .pipe(browserSync.stream());
// });


// gulp.task('sync', function () {
//     browserSync.init({
//         port: 8000,
//         server: {
//             baseDir: "./dist"
//         }
//     });
// });


// gulp.task('dist', gulp.series('copy-imgs','img-comp','copy-sw-manifest', 'copy-html', 'copy-js', 'sass','sync', (done) => {

  
// done();

// }));