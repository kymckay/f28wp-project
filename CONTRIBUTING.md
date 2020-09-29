## Setup

To get setup, you'll need to install [Node.js](https://nodejs.org) and run the command `npm install` in the root directory of the project (where `package.json` can be found).

To ensure formatting consistency between various editors and operating systems, we're using [EditorConfig](https://editorconfig.org). Please check that your text editor or IDE supports it (or install the corresponding plugin).

## Git

We try to follow Chris Beams' [commit message guide](https://chris.beams.io/posts/git-commit) to keep our git history nice and navigatable.

## JavaScript

### Style

Our JavaScript is written in ES6 syntax following the [Airbnb style guide](https://github.com/airbnb/javascript).

### Testing

Currently static analysis is set up via [ESLint](https://eslint.org) and in future unit testing is likely to be added.

Commands:
- `npm run lint` for just static analysis
- `npm test` to run all testing (currently also just static analysis)