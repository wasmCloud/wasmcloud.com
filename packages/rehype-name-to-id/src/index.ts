import { Plugin } from 'unified';
import { hasProperty } from 'hast-util-has-property';
import { Nodes } from 'hast';
import { visit } from 'unist-util-visit';

const rehypeNameToId: Plugin<never> = () => {
  return (tree) => {
    visit(tree, 'element', (node: Nodes) => {
      if (hasProperty(node, 'name')) {
        node.properties.id = node.properties.name;
        node.properties.name = '';
      }
    });
  };
};

export default rehypeNameToId;
