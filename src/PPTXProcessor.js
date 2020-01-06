"use strict";
import {parse} from "./pptx-to-ast";
export default class PPTXProcessor {
    constructor(config) {
        this.config = config;
        this.extensions = config.extensions ? config.extensions : [];
    }

    availableExtensions() {
        return [
            ".pptx"
        ].concat(this.extensions);
    }

    processor(ext) {
        return {
            preProcess(text, filePath) {
                return parse(filePath);
            },
            postProcess(messages, filePath) {
                return {
                    messages,
                    filePath: filePath ? filePath : "<pptx>"
                };
            }
        };
    }
}