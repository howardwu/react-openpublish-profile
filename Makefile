all: clean build

clean:
	rm -rf build/*

build: example/build.js

example/build.js: build/index.js
	./node_modules/.bin/browserify example/example.js -t babelify > $@

build/index.js:
	mkdir -p build
	./node_modules/.bin/babel src --out-dir build
	touch example/example.js
