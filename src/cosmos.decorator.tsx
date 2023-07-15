import { FC, PropsWithChildren } from "react";
import { css } from "../styled-system/css";

const Decorator: FC<PropsWithChildren> = ({ children }) => <div className={decorator}>{children}</div>;

const decorator = css({
  margin: "2rem",
  border: "1px solid #ddd",
});

export default Decorator;
