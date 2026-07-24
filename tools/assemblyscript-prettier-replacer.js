import assemblyscript from "assemblyscript";

export const magic = "MAGIC_ASSEMBLYSCRIPT_PRETTIER_1996";
const prefix = `/*${magic}`;
const postfix = `${magic}*/`;
const NodeKind = assemblyscript.NodeKind;

function visitDecorators(node) {
  const decorators = [];

  function visit(current) {
    switch (current.kind) {
      case NodeKind.Source:
        current.statements.forEach(visit);
        break;
      case NodeKind.ClassDeclaration:
      case NodeKind.InterfaceDeclaration:
      case NodeKind.NamespaceDeclaration:
        current.members.forEach(visit);
        break;
    }
    if (current.decorators) {
      decorators.push(
        ...current.decorators.map((decorator) => ({
          start: decorator.range.start,
          end: decorator.range.end,
        })),
      );
    }
  }

  visit(node);
  return decorators;
}

export function preProcess(code) {
  const parser = new assemblyscript.Parser();
  parser.parseFile(code, "pre_process.ts", false);
  const source = parser.sources[0];
  const decorators = visitDecorators(source);
  decorators.sort((left, right) => left.start - right.start);

  let cursor = 0;
  const protectedDecorators = decorators.map((decorator) => {
    const before = code.slice(cursor, decorator.start);
    const value = code.slice(decorator.start, decorator.end);
    cursor = decorator.end;
    return `${before}${prefix}${value}`;
  });
  protectedDecorators.push(code.slice(cursor));
  return protectedDecorators.join(postfix);
}
