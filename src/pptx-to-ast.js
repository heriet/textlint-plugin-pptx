"use strict";

import AdmZip from "adm-zip";
import { JSONPath } from "jsonpath-plus";
import XMLParser from "fast-xml-parser";


class Presentation {
    constructor() {
        this.slides = [];
    }

    get innerText() {
        let it = "";
        this.slides.forEach(slide => it += slide.innerText);
        return it;
    }

    load(filePath) {
        const zipFile = new AdmZip(filePath);
        const zipEntries = zipFile.getEntries();

        this.slides = zipEntries.filter(zipEntry => Presentation.isSlideEntry(zipEntry))
            .map(zipEntry => Presentation.extractSlide(zipFile, zipEntry));
        
        return this;
    }

    static isSlideEntry(zipEntry) {
        return zipEntry.entryName.substr(0, 16) === "ppt/slides/slide";
    }

    static extractSlide(zipFile, zipEntry) {
        const xmlText = zipFile.readAsText(zipEntry.entryName)

        if(!XMLParser.validate(xmlText)) {
            throw "Invalid Presentation XML";
        }

        // "ppt/slides/".length === 11
        const name = zipEntry.entryName.substr(11, zipEntry.entryName.lastIndexOf(".") - 11);

        const xmlParserOptions = {ignoreAttributes : false}
        return new Slide(name, XMLParser.parse(xmlText, xmlParserOptions));
    }
}

class Slide {
    constructor(name, content) {
        this.name = name;
        this.content = content;
        this.shapes = [];
        
        this.shapes = Slide.extractShapes(this.content);
    }

    get innerText() {
        let it = "";
        this.shapes.forEach(shape => it += shape.innerText);
        return it;
    }

    static extractShapes(content) {
        const shapeContents = JSONPath({path: "$.p:sld.p:cSld.p:spTree.p:sp", json: content})
        return shapeContents.map(shapeContent => {
            return new Shape(shapeContent)
        });
    }
}

class Shape {
    constructor(content) {
        this.name = "";
        this.placeholderType = "body";
        this.paragraphs = []

        this.parseShape(content)
    }

    get innerText() {
        let it = "";
        this.paragraphs.forEach(paragraph => {
            it += paragraph.innerText + "\n\n";
        });
        return it;
    }

    parseShape(content) {
        const cnvProperties = JSONPath({path: "$.p:nvSpPr.p:cNvPr", json: content})[0];
        if(cnvProperties !== undefined && cnvProperties["@_name"] !== undefined) {
            this.name = cnvProperties["@_name"];
        }

        const placeholder = JSONPath({path: "$.p:nvSpPr.p:nvPr.p:ph", json: content})[0];
        if(placeholder !== undefined && placeholder["@_type"] !== undefined) {
            this.placeholderType = placeholder["@_type"];
        }

        const paragraphs = [].concat(JSONPath({path: "$..a:p", json: content}));
        paragraphs.forEach(p => {
            if(Array.isArray(p)){
                p.forEach(pChild => {
                    this.paragraphs.push(new Paragraph(pChild));
                })
            } else {
                this.paragraphs.push(new Paragraph(p));
            }
        });
    }
}

class Paragraph {
    constructor(content) {
        this.texts = [];

        this.parseParagraph(content);
    }

    get innerText() {
        let it = "";
        this.texts.forEach(text => it += text.value);
        return it;
    }

    parseParagraph(content) {
        // TODO parse a:tab and a:br
        this.texts = JSONPath({path: "$..a:t", json: content}).map(t => {
            return new Text(t);
        });
    }
}

class Text {
    constructor(content) {
        this.value = "";

        this.parseText(content);
    }
    parseText(content) {
        this.value = content;
    }
}


class Parser {
    constructor() {
        this.context = {
            line: 1,
            column: 0,
            index: 0,
        }
    }

    perse(filePath) {
        const pptx = new Presentation().load(filePath);
        const ast = this.convertAST(pptx);
        return ast;
    }

    convertAST(pptx) {
        let children = [];

        pptx.slides.forEach(slide => {
            children.push(...this.convertSlideToNodes(slide));
        });

        if (children.length === 0) {
            return this.createEmptyDocument();
        }

        const loc = {
            start: children[0].loc.start,
            end: children[children.length - 1].loc.end,
        };

        const range = [
            children[0].range[0],
            children[children.length - 1].range[1],
        ];

        return {
            type: "Document",
            raw: pptx.innerText,
            range: range,
            loc: loc,
            children: children
          };
    }

    convertSlideToNodes(slide) {
        let nodes = [];
        slide.shapes.forEach(shape => {
            nodes.push(...this.convertShapeToNodes(shape));
        });
        return nodes;
    }

    convertShapeToNodes(shape) {
        let nodes = [];

        // TODO switch for placeholderType
        shape.paragraphs.forEach(paragraph => {
            nodes.push(...this.convertParagraphToNodes(paragraph));
        });
        return nodes;
    }

    convertParagraphToNodes(paragraph) {
        let children = [];

        paragraph.texts.forEach(text => {
            children.push(this.generateTextNode(text));
        });

        // add line break * 2
        this.context.line += 2;
        this.context.column = 0;

        if(children.length === 0) {
            return [];
        }

        const loc = {
            start: children[0].loc.start,
            end: children[children.length - 1].loc.end
        };

        const range = [
            children[0].range[0],
            children[children.length - 1].range[1],
        ];

        return [{
            type: "Paragraph",
            raw: paragraph.innerText,
            range: range,
            loc: loc,
            children: children
        }]
    }

    generateTextNode(text) {
        const start = {
            line: this.context.line,
            column: this.context.column,
        };

        const end = {
            line: this.context.line,
            column: this.context.column + text.value.length,
        };

        const loc = {
            start: start,
            end: end,
        };

        const range = [
            this.context.index,
            this.context.index + text.value.length,
        ];

        this.context.column += text.value.length;
        this.context.index += text.value.length;

        return {
            type: "Str",
            raw: text.value,
            value: text.value,
            range: range,
            loc: loc,
        };
    }

    createEmptyDocument() {
        return {
            type: "Document",
            raw: "",
            range: [0, 0],
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
            children: [],
        };
    }
}

export function parse(filePath) {
    return new Parser().perse(filePath);
}
