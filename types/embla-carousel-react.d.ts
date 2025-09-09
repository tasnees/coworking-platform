declare module 'embla-carousel-react' {
  import { EmblaOptionsType, EmblaCarouselType } from 'embla-carousel';
  import { HTMLAttributes, RefObject, ReactNode, CSSProperties } from 'react';

  export interface EmblaCarouselProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    options?: EmblaOptionsType;
    plugins?: any[];
    axis?: 'x' | 'y';
    setAPI?: (api: EmblaCarouselType) => void;
  }

  export type UseEmblaCarouselType = [
    RefObject<HTMLDivElement>,
    EmblaCarouselType | undefined
  ];

  const useEmblaCarousel = (
    options?: EmblaOptionsType,
    plugins?: any[]
  ): UseEmblaCarouselType => [
    { current: null } as RefObject<HTMLDivElement>,
    undefined
  ];

  const EmblaCarousel: React.FC<EmblaCarouselProps>;
  export { useEmblaCarousel };
  export default EmblaCarousel;
}
