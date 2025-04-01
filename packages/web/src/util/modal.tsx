import { generalError, type Result } from "@darkruby/assets-core";
import * as E from "fp-ts/lib/Either";
import { createRoot } from "react-dom/client";

export type DialogDrivenComponentProps<
  T,
  PP extends Record<string, any> = {}
> = {
  value?: T;
  onSubmit: (t: T) => void;
  onClose: () => void;
  open: boolean;
} & PP;

export type Dialog<T, P extends DialogDrivenComponentProps<T>> = React.FC<P>;

export const createDialog =
  <T, P extends DialogDrivenComponentProps<T>>(Component: Dialog<T, P>) =>
  (props: Omit<P, "open" | "onSubmit" | "onClose">): Promise<Result<T>> => {
    const containerElement = document.createElement("div", {});
    containerElement.id = "dialog-root";
    const root = document.getElementById("root");
    root?.appendChild(containerElement);
    const container = createRoot(containerElement);

    const render = (p: P): Promise<void> => {
      const newProps = { ...props, ...p } as P;

      return Promise.resolve(
        container.render(<Component {...props} {...newProps} />)
      );
    };

    const confirmation = new Promise<Result<T>>((resolve, reject) => {
      const p = {
        ...props,
        onSubmit: (r: T) => resolve(E.of(r)),
        onClose: () => resolve(E.left(generalError("modal cacnelled"))),
        open: true,
      } as unknown as P;

      return render(p);
    });

    return confirmation.finally(() =>
      render({
        ...props,
        onSubmit: () => void 0,
        onClose: () => void 0,
        open: false,
      } as unknown as P).then(() => {
        containerElement?.remove();
      })
    );
  };
