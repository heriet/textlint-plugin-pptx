"use strict";

export class PPTXTxtNode { // implements TxtNode
    constructor({type = "", raw = "", range = null, loc = null, parent = null} = {}) {
        this.type = type;
        this._raw = raw;
        this.range = range;
        this.loc = loc;
        this._parent = parent;
    }

    get raw() {
        return this._raw;
    }

    get parent() {
        return this._parent;
    }
}

export class PPTXTxtTextNode extends PPTXTxtNode { // implements TxtTextNode
    constructor({type = "", raw = "", range = null, loc = null, parent = null, value = ""} = {}) {
        super({
            type: type,
            raw: raw,
            range: range,
            loc: loc,
            parent: parent,
        });

        this.value = value;
    }
}

export class PPTXTxtParentNode extends PPTXTxtNode { // implements TxtParentNode
    constructor({
        type = "",
        raw = "",
        range = null,
        loc = null,
        parent = null,
        children = [],
        prefix = "",
        suffix = "",
    } = {}) {
        super({
            type: type,
            raw: raw,
            range: range,
            loc: loc,
            parent: parent,
        });
        this.children = children;

        this.prefix = prefix
        this.suffix = suffix
    }

    get raw() {
        let r = "";
        this.children.forEach(text => r += text.raw);
        return this.prefix + r + this.suffix;
    }
}

export class PPTXTxtNodeLineLocation { // implements TxtNodeLineLocation
    constructor({start = new PPTXTxtNodePosition(), end = new PPTXTxtNodePosition()} = {}) {
        this.start = start;
        this.end = end;
    }
}

export class PPTXTxtNodePosition {
    constructor({line = 1, column = 0} = {}) {
        this.line = line;
        this.column = column;
    }

    static createAddTextPosition(pos, text) {
        const lines = text.split(/\r?\n/);
        const lineNum = lines.length - 1;
        const columnLength = lines[lines.length - 1].length;

        return new PPTXTxtNodePosition({
            line: pos.line + lineNum,
            column: lineNum === 0 ? pos.column + columnLength : columnLength,
        })
    }

    static createSubTextPosition(pos, text) {
        const lines = text.split(/\r?\n/);
        const lineNum = lines.length - 1;
        const columnLength = lines[lines.length - 1].length;

        return new PPTXTxtNodePosition({
            line: pos.line - lineNum,
            column: lineNum === 0 ? pos.column - columnLength : 0, // column may not 0
        })
    }
}