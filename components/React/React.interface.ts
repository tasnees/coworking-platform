export interface IReact {
  name: string;
}

export interface Props {
  /**
   * The text to display in the component
   * @default 'Hello from React component'
   */
  text?: string;
}

export const defaultProps: Required<Pick<Props, 'text'>> = {
  text: 'Hello from React component',
};

// For Builder.io integration
export const builderIoSettings = {
  name: 'React',
  inputs: [
    {
      name: 'text',
      type: 'string',
      defaultValue: defaultProps.text,
    },
  ],
};
