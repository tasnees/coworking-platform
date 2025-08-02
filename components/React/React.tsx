import { Props, defaultProps } from "./React.interface";
import styles from "./React.module.scss";

function React({
  text = defaultProps.text,
}: Props) {
  return (
    <div className={styles.reactComponent}>
      {text}
    </div>
  );
}

export default React;

export { builderIoSettings } from "./React.builderIo";
