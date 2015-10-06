# hb-gulp - Harp Boilerplate on Steroids

**A(nother) Harp Boilerplate; on steroids.** :godmode:

## Quickstart

[Download](https://github.com/douggr/hp-gulp/archive/master.zip) or clone this repository and build:

```shell
git clone https://github.com/douggr/hp-gulp
cd hp-gulp
npm i -g gulp
npm install
gulp serve
```

And finally, navigate to [http://localhost:3000](http://localhost:3000)

## Commands
#### Watch For Changes & Automatically Refresh Across Devices
```sh
gulp serve
# or
gulp serve:dist
```

This outputs an IP address you can use to locally test and another that can be used on devices connected to your network.

#### Build & Optimize
```sh
gulp
```
Build and optimize the current project, ready for deployment.

Just publish the `dist` folder to your production server.

## Features

#### Performance optimization with a build process powered by Gulp

Minify and concatenate JavaScript, CSS, HTML and images to help keep your pages lean (even better than `harp compile`).

#### Live Browser Reloading

Reload the browser in real-time anytime an edit is made without the need for an extension (even better than `harp server`).

#### Cross-device Synchronization

Synchronize clicks, scrolls, forms and live-reload across multiple devices as you edit your project. Powered by [BrowserSync](http://browsersync.io).

#### ES2015 Support

Optional ES2015 support using [Babel](https://babeljs.io/). To disable ES2015 support uncomment the line `"only": "gulpfile.babel.js",` in the [.babelrc](.babelrc) file.

## Documentation
  - Harp [docs](http://harpjs.com/docs/)
  - The build pipeline is heavily based on [Google's Web Starter Kit](https://github.com/google/web-starter-kit)

## Prerequisites
Follow [this](https://github.com/google/web-starter-kit/blob/master/docs/install.md#prerequisites)
