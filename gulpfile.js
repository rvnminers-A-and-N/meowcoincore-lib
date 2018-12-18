var gulp = require('gulp');
var ravencoreTasks = require('ravencore-build');

ravencoreTasks('lib');
gulp.task('default', ['lint', 'test', 'browser', 'coverage']);
