# WIP: acot-reporter-github

A GitHub reporter for [acot](https://github.com/acot-a11y/acot).

## TODOs for MVP

- [x] Show summarized result
- [x] Show detailed result (expandable)
- [ ] CI (automated release)
- [ ] Delete and ignore `lib` directory

## Optional TODOs

- [ ] Show progress

## Usage

### Installation

Install via npm:

```bash
$ npm install --save acot-reporter-github
```

Install via yarn:

```bash
$ yarn add acot-reporter-github
```

### Configuration

```javascript
module.exports = {
  reporter: "github",
};
```
