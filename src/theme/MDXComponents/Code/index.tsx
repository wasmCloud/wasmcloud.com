import type { Props } from '@theme/MDXComponents/Code';
import clsx from 'clsx';
import type { ComponentProps } from 'react';
import React from 'react';
import CopyButton from './CopyButton';
import codeBlockStyles from './CodeBlock.module.css';
import { getTextForCopy } from '@site/src/theme/MDXComponents/Code/utils/getTextForCopy';

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

function CodeBlock(props: ComponentProps<'code'>) {
  const codeRef = React.useRef<HTMLElement>(null);
  const language = props.className?.replace(/language-/, '');
  const code = getTextForCopy(props.children);

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
