module.exports = function(grunt) {

    grunt.initConfig({
      responsive_images: {
        dev: {
          options: {
            engine: 'gm',
            sizes: [{
              width: 800,
              name: 'medium',
              quality: 40
            },
            {
                width: 1600,
                name: 'large',
                quality: 60
              },
              {
                width: 700,
                name: 'small',
                quality: 30
              }]
          },
          files: [{
            expand: true,
            src: ['*.{gif,jpg,png}'],
            cwd: 'img/',
            dest: 'img/comp/'
          }]
        }
      },
    })
    
    
    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.registerTask('default', ['responsive_images']);
  
  };