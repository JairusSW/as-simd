import pluginEstree from "prettier/plugins/estree";
import pluginTypescript from "prettier/plugins/typescript";
import { builders } from "prettier/doc";
import { magic, preProcess } from "./assemblyscript-prettier-replacer.js";

const estreePrinter = pluginEstree.printers.estree;

const assemblyScriptEstree = {
  ...estreePrinter,
  printComment(commentPath, options) {
    const comment = commentPath.getValue().value;
    if (comment.startsWith(magic) && comment.endsWith(magic)) {
      const doc = [];
      if (commentPath.stack[commentPath.stack.length - 2] === 0) {
        doc.push(builders.hardline);
      }
      doc.push(comment.slice(magic.length, -magic.length));
      return doc;
    }
    return estreePrinter.printComment(commentPath, options);
  },
};

export default {
  parsers: {
    typescript: {
      ...pluginTypescript.parsers.typescript,
      astFormat: "assemblyscript-estree",
      preprocess: preProcess,
    },
  },
  printers: { "assemblyscript-estree": assemblyScriptEstree },
};
