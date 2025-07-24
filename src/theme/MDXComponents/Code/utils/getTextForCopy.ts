import * as React from 'react';

function nodeIsReactElement<P extends Record<string, unknown>>(
  node: React.ReactNode,
  props?: P,
): node is React.ReactElement<P> {
  // Most of the times the copiable elements are within one span and as children finger
  if (React.Children.count(node) === 1 && React.isValidElement(node) && node.type === "span") {
    return true;
  }
  if (!React.isValidElement(node)) return false;
  return props && Object.keys(props).every((key) => key in (node.props as object));
}

function hasClassName(node: React.ReactNode, className: string): boolean {
  if (!nodeIsReactElement(node)) return false;
  if (typeof node.props.className !== 'string') return false;
  return node.props.className.includes(className);
}

function hasReactChildren(
  node: React.ReactNode,
): node is React.ReactElement<React.PropsWithChildren> {
  if (!nodeIsReactElement(node)) return false;
  return React.Children.count(node.props.children) > 0;
}

function getTextForCopy(node?: React.ReactNode | null): string {
  if (node === null || node === undefined) return '';
  return stripDiffSpacer(getTextFromNode(node));
}

// the `\uFEFF` character is the ZERO WIDTH NO-BREAK SPACE that is invisible in most fonts
const WHITESPACE_REPLACEMENT_STRING = '\uFEFF \n' as const;

// should be identical to `WHITESPACE_REPLACEMENT_STRING` but with the additional newline char
const WHITESPACE_REPLACEMENT_REGEXP = /\uFEFF \n\n/g;
const stripDiffSpacer = (str: string): string => str.replace(WHITESPACE_REPLACEMENT_REGEXP, '');

const getTextFromNode = (node: React.ReactNode): string => {
  // When getting all the text from a node, we want to remove the diff lines that were marked as
  // "removed" in the diff. Since code blocks are split up by line, and here we are only handling
  // one line at a time, we can't remove the following newline at the same time. To do that, we are
  // adding a recognizable but invisible whitespace character which will be stripped later.

  switch (typeof node) {
    case 'string':
    case 'number':
      return node.toString();
    case 'boolean':
      return '';
    case 'object':
      // The code snippet declares that this part is historical, removed with this step
      if (hasClassName(node, 'diff remove')) return WHITESPACE_REPLACEMENT_STRING;
      // Recursion since the multiple level of the copiable contens react segmentaion
      if (hasReactChildren(node)) {
        return getTextFromNode(node.props.children)
      };
      // Recursion since the multiple level of the copiable contens react segmentaion
      if (node instanceof Array) {
        return React.Children.map(node, getTextForCopy).join('');
      }
      // Cannot serialise to make it copiable
      if (!nodeIsReactElement(node)) return '';
      // Default empty
      return '';
    default:
      // Fallback default empty
      return '';
  }
};

export { getTextForCopy };
