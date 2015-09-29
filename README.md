# harp-bp
### Command line interface for creating new projects from scratch.
#### Why? - Based in a text in harpjs.com
> Often, starting a new project requires the same boilerplate code over and over. This is helpful if you want to create a project with a sane starting point and common defaults.

## Prerequisites
  1. [Node.js](https://nodejs.org)
  2. [gulp](http://gulpjs.com)
  3. [Harp](http://harpjs.com) - optional

## tl;dr
Open a terminal type the following:
```sh
git clone https://github.com/douggr/harp-bp my-app
cd my-app
npm install
gulp
```
Point your browser to http://localhost:3000

## Live example
Untouched [example](http://douggr.github.io/harp-bp) denerated by gulp build.

## Development Setup
Bring up a terminal and type:
```sh
git clone https://github.com/douggr/harp-bp my-app
# or
harp init my-app -b douggr/harp-bp
```

1. cd into `my-app`
2. install local dependencies by running `npm install`
3. run `gulp`
4. open http://localhost:3000

## Preprocessors
- Markdown
- EJS
- **Jade** (default)
- LESS
- **Sass** (default)
- Stylus
- CoffeeScript
