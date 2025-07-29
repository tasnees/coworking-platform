export interface IReact {
  name: string;
}

export type Props = {
  text ? : string;
};

export const defaultProps: Props = {
  text: "hello hayde",
};
