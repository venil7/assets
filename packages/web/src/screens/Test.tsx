import { defaultPortfolio, type PostTx } from "@darkruby/assets-core";
import { useHead } from "@unhead/react";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { useState } from "react";
import { PrimaryButton, SecondaryButton } from "../components/Form/FormControl";
import { TabContent, Tabs } from "../components/Form/Tabs";
import { confirmationModal } from "../components/Modals/Confirmation";
import { PortfolioMenu } from "../components/Portfolio/Menu";
import { portfolioModal } from "../components/Portfolio/PortfolioFields";
import { HelpTip } from "../components/Tooltip/HelpTip";
import { TickerLookup } from "../components/Tx/TickerLookup";
import { txsUploadModal } from "../components/Tx/TxsFields";
import {
  decimalFormatter,
  moneyFormatter,
  percentFormatter
} from "../util/number";

const money = moneyFormatter("AUD", "fr-FR");
const decimal = decimalFormatter("de-DE");
const percent = percentFormatter("de-DE");

const Tab4: React.FC = () => {
  const [tx, setTx] = useState<PostTx[]>([]);
  const handleUpload = async () => {
    const zzz = await txsUploadModal("EUR");
    if (E.isRight(zzz)) {
      setTx(zzz.right.txs);
    }
  };
  return (
    <>
      <button onClick={handleUpload}>x</button>
      <HelpTip
        label="help"
        text={
          <>
            text
            <br />
            more text
          </>
        }
      />
    </>
  );
};

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

  useHead({ title: "Assets - Test" });

  return (
    <>
      <Tabs tabs={["Buttons", "Menus", "Formatting", "Upload"]}>
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
            <li>{money(40123)}</li>
            <li>{decimal(0.012)}</li>
            <li>{percent(0.012, 2)}</li>
          </ul>
        </TabContent>
        <TabContent tab={3}>
          <Tab4 />
        </TabContent>
      </Tabs>
    </>
  );
};

const TestScreen = RawTestScreen;
export { TestScreen };
