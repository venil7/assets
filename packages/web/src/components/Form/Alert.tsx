import { pipe } from "fp-ts/lib/function";
import { Alert } from "react-bootstrap";
import { withVisibility } from "../../decorators/nodata";
import { withProps } from "../../decorators/props";

export const Success = pipe(
  Alert,
  withProps({ variant: "success" }),
  withVisibility()
);

export const Warning = pipe(
  Alert,
  withProps({ variant: "warning" }),
  withVisibility()
);

export const Info = pipe(
  Alert,
  withProps({ variant: "info" }),
  withVisibility()
);
export const Light = pipe(
  Alert,
  withProps({ variant: "light" }),
  withVisibility()
);
export const Dark = pipe(
  Alert,
  withProps({ variant: "dark" }),
  withVisibility()
);

export const Danger = pipe(
  Alert,
  withProps({ variant: "danger" }),
  withVisibility()
);
