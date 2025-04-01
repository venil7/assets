import { pipe } from "fp-ts/lib/function";
import type { PropsWithChildren } from "react";
import { Stack, type StackProps } from "react-bootstrap";
import { withProps } from "../../decorators/props";

export const HorizontalStack = pipe(
  Stack,
  withProps({ direction: "horizontal" })
) as React.FC<Omit<StackProps, "direction"> & PropsWithChildren>;
