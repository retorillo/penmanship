@set browserify=node node_modules\browserify\bin\cmd.js
@set pug=node node_modules\pug-cli
@set less=node node_modules\less\bin\lessc
@set uglifyjs=node node_modules\uglify-js-es6\bin\uglifyjs
@set uglifycss=node node_modules\uglifycss\uglifycss
%browserify% src\index.js -o dist\index.js
%pug% -o . src\index.pug
%less% --strict-imports src\index.less dist\index.css
%uglifyjs% dist\index.js -o dist\index.min.js -c
%uglifycss% --output dist\index.min.css dist\index.css 
