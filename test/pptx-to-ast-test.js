"use strict";
import path from "path";

import { test as testAST } from "@textlint/ast-tester";
import { parse } from "../src/pptx-to-ast.js";

describe("pptx-to-ast-test", function () {
    it("should return AST that passed isTxtAST", function () {
        const fixture = path.join(__dirname, "fixtures/valid.pptx")
        const ast = parse(fixture)
        testAST(ast);
    });
})