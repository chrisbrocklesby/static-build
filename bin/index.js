#!/usr/bin/env node
import { Liquid } from 'liquidjs'
import fs from 'node:fs'
import path from 'node:path'

const packageJSON = JSON.parse(
  fs.readFileSync('package.json', 'utf8'),
);

const line = '-'.repeat(process.stdout.columns)

try {
  console.log(line)
  console.log(`\nStatic Build : v${packageJSON.version} 🏗️ \n`)
  const engine = new Liquid();

  const args = process.argv.slice(2);


  const parsedArgs = { input: './views', output: './build' };
  args.forEach(arg => {
    const flags = arg.split('=');

    if (flags.length) {
      const key = flags[0].replace('--', '');
      const value = flags[1] || true;
      parsedArgs[key] = value
    }
  });

  if (!fs.existsSync(parsedArgs.input)) {
    throw new Error(`Directory path: ${parsedArgs.input} was not found.`)
  }

  let siteConfig = {}
  function siteFile() {
    if (fs.existsSync(`${parsedArgs.input + '/_site.json'}`)) {
      siteConfig = JSON.parse(fs.readFileSync(parsedArgs.input + '/_site.json', 'utf8'))
    }
  }
  siteFile()


  function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((file) => {
      if (file.isDirectory() && file.name.startsWith('_')) {
        return []; // Skip directories beginning with underscores.
      }
      if (file.isDirectory()) {
        return walk(path.join(dir, file.name)); // Recurse into other directories.
      }
      return [path.join(dir, file.name)];
    });
  }



  const files = walk(parsedArgs.input)

  function build(files, options = { rebuild: false }) {
    const inputPath = path.normalize(parsedArgs.input)
    const outputPath = path.normalize(parsedArgs.output)

    if (options.rebuild) {
      console.log('\nRebuilding... 💥🏗️ \n')
      fs.rmSync(outputPath, { recursive: true, force: true });
    } else {
      console.log('\nBuilding... 🏗️ \n')
    }

    console.time('Build Time')

    for (const file of files) {

      const directory = path.dirname(`${outputPath}${file.replace(inputPath, '')}`)
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(`${directory}`, { recursive: true })
      }

      if (
        file.endsWith('.html') ||
        file.endsWith('.liquid') ||
        file.endsWith('.md') ||
        file.endsWith('.markdown') ||
        file.endsWith('.xml') ||
        file.endsWith('.txt')) {
        console.log(`[Building] ${file.replace(inputPath, '')}`)
        const render = engine.renderFileSync(file, { site: siteConfig })
        fs.writeFileSync(`${outputPath}${file.replace(inputPath, '')}`, render)
      } else {
        if (!file.includes('_site.json')) {
          console.log(`[Copying] ${file.replace(inputPath, '')}`)
          fs.copyFileSync(file, `${outputPath}${file.replace(inputPath, '')}`)
        }
      }
    }

    console.log('\nBuild Complete ✅')
    console.timeEnd('Build Time')
    console.log('\n' + line)
  }

  build(files)

  if (parsedArgs.watch) {
    const inputPath = path.normalize(parsedArgs.input)
    console.log(`\n[Watching] ${parsedArgs.input} 👀 \n`)

    fs.watch(parsedArgs.input, { recursive: true }, (eventType, filename) => {

      if (eventType === 'change') {
        fs.stat(`${inputPath}/${filename}`, function (error, stat) {
          if (error) return;
          if (stat.isFile()) {
            if (filename === '_site.json') {
              const files = walk(parsedArgs.input)
              siteFile() // Update site config then rebuild
              build(files, { rebuild: true })
            } else {
              build([`${inputPath}/${filename}`])
            }
          }
        })
      } else {
        const files = walk(parsedArgs.input)
        siteFile() // Update site config then rebuild
        build(files, { rebuild: true })
      }

    });

  }

} catch (error) {
  console.error(`Error: ${error.message || 'Unknown Error'}`)
  console.log('\nBuild Failed... ❌ \n')
  console.log(line)
  process.exit(1)
}

