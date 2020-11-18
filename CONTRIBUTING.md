## Contents
1. [Development Setup](#development-setup)
2. [Style Standards](#style-standards)
3. [Testing](#testing)
4. [Deployment](#deployment)

## Development Setup

To get setup, you'll need to install [Node.js](https://nodejs.org) and run the command `npm install` in the root directory of the project (where `package.json` can be found).

To ensure formatting consistency between various editors and operating systems, we're using [EditorConfig](https://editorconfig.org). Please check that your text editor or IDE supports it (or install the corresponding plugin).

## Style Standards

Our JavaScript is written in ES6 syntax following the [Airbnb style guide](https://github.com/airbnb/javascript).

We try to follow Chris Beams' [commit message guide](https://chris.beams.io/posts/git-commit) to keep our git history nice and navigatable.

## Testing

To manually test changes to the site and game you'll need to run it on a local server. This is all set up if you followed the [setup steps](#development-setup) above. You can use `npm start` to start the server.

Currently static analysis is set up via [ESLint](https://eslint.org). Note that if you are developing on Windows, Git will convert line endings to CRLF by default on checkout (which ESLint won't like if you run it locally), you can set `git config core.autocrlf input` to preserve line endings on checkout and convert any CRLF to LF on commit (which our project expects) - use the `--global` flag if you want Git to do this for all repositories.

Commands:
- `npm start` to launch a local server hosting the site and game
- `npm run lint` for just static analysis
- `npm test` to run all testing (currently also just static analysis, will add unit tests here in future)

### Travis CI

The repository does contain configuration for [Travis CI](https://travis-ci.org) which automatically runs `npm test` and reports any failed tests automatically in the GitHub UI (little green checks or red crosses beside the commit). Note that this has only been configured to run for pull requests and I'm only allocated a certain number of free tokens each month so if those run out it will stop running until they're refreshed the next month.

## Deployment

Whenever `npm run build` or `npm run start` is used, our client-side JavaScript is both bundled and transpiled for the best of both worlds (browser compatibility and newer language features) as detailed below.

### Bundling

Our client-side source code is written using ES6 modules, so we're bundling it using [Rollup](https://rollupjs.org) which means:
- Only a single file (`public/dist/game.js`) needs to be distributed to clients instead of multiple requests being sent for each script.
- More browsers (and older browser versions) are supported by avoiding the use of ES6 modules.

### Transpiling

Transpilation from ES6 syntax to ES5 syntax is done using [Babel](https://babeljs.io), which allows us to write source code using more convenient ES6 syntax, but still deploy client-side code that will run in older browsers and browsers which haven't yet implemented all ES6 language features. With polyfills provided by [core-js](https://www.npmjs.com/package/core-js).
