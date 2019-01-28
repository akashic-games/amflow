var gulp = require("gulp");
var del = require("del");
var tslint = require("gulp-tslint");
var shell = require("gulp-shell");
var path = require("path");
var pkg = require("./package.json");

gulp.task("clean", function(cb) {
	del(["lib"], cb);
});

gulp.task("compile", shell.task("tsc", {cwd: __dirname}));

gulp.task("test", ["compile"], shell.task("tsc -p ./test", {cwd: __dirname}));

gulp.task("textlint", shell.task("textlint -f pretty-error ./README.md", {cwd: __dirname}));

gulp.task("lint", ["textlint"], function(){
	return gulp.src("src/**/*.ts")
		.pipe(tslint())
		.pipe(tslint.report());
});

gulp.task("default", ["compile"]);
