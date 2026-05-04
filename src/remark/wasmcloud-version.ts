interface Options {
  version: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function replaceInNode(node: any, version: string): void {
  if (node.type === 'code' || node.type === 'inlineCode') {
    node.value = (node.value as string).replaceAll('{{WASMCLOUD_VERSION}}', version);
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      replaceInNode(child, version);
    }
  }
}

export default function wasmCloudVersionPlugin(options: Options) {
  return (tree: unknown) => {
    replaceInNode(tree, options.version);
  };
}
