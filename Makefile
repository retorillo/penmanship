browserify=node node_modules\browserify\bin\cmd.js
pug=node node_modules\pug-cli
less=node node_modules\less\bin\lessc
uglifyjs=node node_modules\uglify-js-es6\bin\uglifyjs
uglifycss=node node_modules\uglifycss\uglifycss

build:
	$(browserify) src\index.js -o dist\index.js
	$(pug) -o . src\index.pug
	$(less) --strict-imports src\index.less dist\index.css
	$(uglifyjs) dist\index.js -o dist\index.min.js -c
	$(uglifycss) --output dist\index.min.css dist\index.css 
