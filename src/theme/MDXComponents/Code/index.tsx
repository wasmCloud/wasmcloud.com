import type { Props } from '@theme/MDXComponents/Code';
import clsx from 'clsx';
import type { ComponentProps } from 'react';
import React from 'react';
import CopyButton from './CopyButton';
import codeBlockStyles from './CodeBlock.module.css';

function shouldBeInline(props: Props): boolean {
  return (
    // empty code blocks have no props.children,
    // see https://github.com/facebook/docusaurus/pull/9704
    typeof props.children !== 'undefined' &&
    React.Children.toArray(props.children).every(
      (el) => typeof el === 'string' && !el.includes('\n'),
    )
  );
}

function nodeIsReactElement<P extends Record<string, unknown>>(
  node: React.ReactNode,
  props?: P,
): node is React.ReactElement<P> {
  if (!React.isValidElement(node)) return false;

  const hasAllProps = props && Object.keys(props).every((key) => key in (node.props as object));
  if (!hasAllProps) return false;

  return true;
}

function hasClassName(node: React.ReactNode, className: string): boolean {
  if (!nodeIsReactElement(node)) return false;
  if (typeof node.props.className !== 'string') return false;
  return node.props.className.includes(className);
}

// the `\uFEFF` character is the ZERO WIDTH NO-BREAK SPACE that is invisible in most fonts
const WHITESPACE_REPLACEMENT_STRING = '\uFEFF \n';
const WHITESPACE_REPLACEMENT_REGEX = new RegExp(`${WHITESPACE_REPLACEMENT_STRING}\n`, 'g');

function getTextForCopy(node: React.ReactNode): string {
  if (node === null) return '';

  switch (typeof node) {
    case 'string':
    case 'number':
      return node.toString();
    case 'boolean':
      return '';
    case 'object':
      if (node instanceof Array) return React.Children.map(node, getTextForCopy).join('');
      if (!nodeIsReactElement(node)) return '';
      // when skipping lines that are "removed" in a diff, we also need to remove the following line, so here we are
      // adding a recognizable but invisible whitespace character which will be stripped later
      if (hasClassName(node, 'diff remove')) return WHITESPACE_REPLACEMENT_STRING;
      return getTextForCopy(React.isValidElement(node.props.children) ? node.props.children : null);
    default:
      return '';
  }
}

function stripDiffSpacer(str: string): string {
  // remove the extra space added to removed lines in diffs
  return str.replace(WHITESPACE_REPLACEMENT_REGEX, '');
}

function CodeBlock(props: ComponentProps<'code'>) {
  const codeRef = React.useRef<HTMLElement>(null);
  const language = props.className?.replace(/language-/, '');
  const code = stripDiffSpacer(getTextForCopy(props.children));

  return (
    <div className={codeBlockStyles.CodeBlock}>
      <div className={codeBlockStyles.header}>
        <div>{language}</div>
        <CopyButton className={codeBlockStyles.button} code={code} />
      </div>
      <div className={codeBlockStyles.content}>
        <pre className={clsx(codeBlockStyles.pre, 'shiki')}>
          <code {...props} ref={codeRef} />
        </pre>
      </div>
    </div>
  );
}

export default function MDXCode(props) {
  return shouldBeInline(props) ? <code {...props} /> : <CodeBlock {...props} />;
}
