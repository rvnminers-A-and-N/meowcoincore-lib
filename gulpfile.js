var gulp = require('gulp');
var meowcoincoreTasks = require('meowcoincore-build');

meowcoincoreTasks('lib');
gulp.task('default', ['lint', 'test', 'browser', 'coverage']);
