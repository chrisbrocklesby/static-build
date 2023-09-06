# Static Build

A static site generator using liquid templates.

Engine: [https://liquidjs.com/](https://liquidjs.com/)

Templating Language: [https://shopify.github.io/liquid/](https://shopify.github.io/liquid/)

## Global Install
```bash
npm install @chrisbrocklesby/static-build -g
```

## Local Install
```bash
npm install @chrisbrocklesby/static-build --save-dev
```

## Usage

### Preqrequisites
A views folder with a layout file and a folder for each page. Default ./views and within that folder liquid files for the layout and pages.

### Run
If install globally
```bash
static-build --input ./views --output ./build --watch
```

If installed locally
```bash
node_modules/.bin/static-build --input ./views --output ./build --watch
```

or add to package.json
```json
"scripts": {
    "build": "static-build --input ./views --output ./build --watch"
}
```
