import { pipe } from "fp-ts/lib/function";
import { withOverridenProps } from "../decorators/props";

type SomeProps = { some: number };
const SomeComponent: React.FC<SomeProps> = ({ some }) => {
  return <div>{some}</div>;
};

const SomeOtherComponent = pipe(
  SomeComponent,
  withOverridenProps<SomeProps, "some", { some: (n: number[]) => number }>({
    some: (n: number[]) => n.reduce((x: number, y: number) => x + y),
  })
);

const RawTestScreen: React.FC = () => {
  return (
    <>
      <SomeComponent some={10} />
      <SomeOtherComponent some={[1, 2, 3, 4, 7]} />
    </>
  );
};

const TestScreen = RawTestScreen;
export { TestScreen };
