declare module '@builder.io/sdk' {
  import { ReactNode } from 'react';

  export interface BuilderComponentProps {
    model?: string;
    content?: any;
    data?: any;
    context?: any;
    children?: ReactNode;
    [key: string]: any;
  }

  export function BuilderComponent(props: BuilderComponentProps): JSX.Element;
  export function Builder(props: BuilderComponentProps): JSX.Element;
  
  export const Builder: {
    Component: typeof BuilderComponent;
    isStatic: boolean;
    isEditing: boolean;
    isPreviewing: boolean;
    isBrowser: boolean;
    isServer: boolean;
  };

  export function useIsPreviewing(): boolean;
  export function useIsEditing(): boolean;
  export function useBuilderContext(): any;
  export function useBuilderData(): any;
  export function useBuilderContent(
    model: string, 
    options?: { 
      query?: any; 
      initialContent?: any; 
      key?: string | string[] | null 
    }
  ): [any, boolean, any];
}
