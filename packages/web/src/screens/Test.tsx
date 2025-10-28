import { defaultPortfolio } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { PrimaryButton, SecondaryButton } from "../components/Form/FormControl";
import { TabContent, Tabs } from "../components/Form/Tabs";
import { confirmationModal } from "../components/Modals/Confirmation";
import { PortfolioMenu } from "../components/Portfolio/Menu";
import { portfolioModal } from "../components/Portfolio/PortfolioModal";
import { TickerLookup } from "../components/Tx/TickerLookup";
import { decimal, money, percent } from "../util/number";

const RawTestScreen: React.FC = () => {
  const handler1 = () => {
    return pipe(
      () => portfolioModal(defaultPortfolio()),
      TE.tapIO((p) => () => console.log(p))
    )();
  };

  const handler2 = () => {
    return pipe(
      () => confirmationModal("yes or maybe not"),
      TE.tapIO((p) => () => console.log(p))
    )();
  };

  return (
    <>
      <Tabs tabs={["Buttons", "Menus", "Formatting"]}>
        <TabContent tab={0}>
          <PrimaryButton onClick={handler1}>click</PrimaryButton>
          <SecondaryButton onClick={handler2}>click</SecondaryButton>
        </TabContent>
        <TabContent tab={1}>
          <PortfolioMenu onDelete={handler1} onEdit={handler1} />
          <TickerLookup onSelect={console.log} />
        </TabContent>
        <TabContent tab={2}>
          <ul>
            <li>{money(40123, "AUD", "fr-FR")}</li>
            <li>{decimal(0.012, 2, "de-DE")}</li>
            <li>{percent(0.012, 2, "de-DE")}</li>
          </ul>
        </TabContent>
      </Tabs>
    </>
  );
};

const TestScreen = RawTestScreen;
export { TestScreen };
