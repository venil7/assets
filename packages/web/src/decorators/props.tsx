import type { Identity } from "@darkruby/assets-core";
import type { Props } from "./fetching";

export type UnmappedProps<P extends Props, Part extends Partial<P>> = Identity<
  Omit<P, keyof Part>
>;

export function withProps<P extends Props, Pr extends Partial<P>>(
  preProps: Pr
) {
  return function (Component: React.FC<P>): React.FC<UnmappedProps<P, Pr>> {
    return (props: UnmappedProps<P, Pr>) => {
      const combined = { ...preProps, ...props } as unknown as P;
      return <Component {...combined} />;
    };
  };
}

type Mapping<T extends Props, K extends keyof T> = {
  [P in K]: (arg: any) => T[P];
};

type MappedProps<T extends Props, M> = {
  [K in keyof T]: K extends keyof M
    ? M[K] extends (arg: infer U) => any
      ? U
      : never
    : T[K];
};

export function withOverridenProps<
  P extends Props,
  K extends keyof P,
  M extends Mapping<P, K>
>(mapping: M) {
  return function (Component: React.FC<P>) {
    return (p: MappedProps<P, M>) => {
      const unmappedProps = {} as P;
      for (const key of Object.keys(mapping)) {
        unmappedProps[key as K] = mapping[key as K](p[key as K]) as P[K];
      }
      const combinedProps = { ...p, ...unmappedProps };
      return <Component {...(combinedProps as unknown as P)} />;
    };
  };
}
