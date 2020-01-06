# textlint-plugin-pptx

WIP

Add PowerPoint(pptx) support for [textlint](https://github.com/textlint/textlint "textlint").


## Installation

```
    npm install textlint-plugin-pptx
```

## Default supported extensions

- `.pptx`

## Usage

See also [example](./example).

Manually add text plugin to do following:

```
{
    "plugins": [
        "pptx"
    ]
}
```

Lint pptx file with textlint:

```
$ textlint slide.pptx
```

## Develop

Develop for docker:

```
$ make build-develop-image
$ make develop

$ npm test
```

## License

MIT