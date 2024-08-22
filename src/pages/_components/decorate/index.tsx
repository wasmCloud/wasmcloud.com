import { SketchUnderline } from '@site/src/pages/_components/sketch-underline';
import { SketchSparkles } from '../sketch-sparkles';

type Props = {
  children: string;
};

/**
 * tagged template function to decorate input with underline `_(.*?)_` and sparkles `\*(.*?)\*`
 * @example decorate`Hello _world_ and *everyone*` => <>Hello <SketchUnderline>world</SketchUnderline> and <span>everyone<SvgSparkles /></span></>
 * @returns ReactNode with heading decorated
 */
function DecorateText({ children }: Props): React.ReactNode {
  const result = children.split(/(_.*?_|\*.*?\*)/).map((part, i) => {
    if (part.startsWith('_')) {
      return <SketchUnderline key={i}>{part.slice(1, -1)}</SketchUnderline>;
    }
    if (part.startsWith('*')) {
      return <SketchSparkles key={i}>{part.slice(1, -1)}</SketchSparkles>;
    }
    return part;
  });
  return <>{result}</>;
}

export { DecorateText };
