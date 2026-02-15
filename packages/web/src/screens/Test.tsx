import { defaultPortfolio, type GetPortfolio } from "@darkruby/assets-core";
import { useHead } from "@unhead/react";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { PrimaryButton, SecondaryButton } from "../components/Form/FormControl";
import { TabContent, Tabs } from "../components/Form/Tabs";
import { confirmationModal } from "../components/Modals/Confirmation";
import { PortfolioMenu } from "../components/Portfolio/Menu";
import { portfolioModal } from "../components/Portfolio/PortfolioFields";
import { portfoliosSelectModal } from "../components/Portfolio/PortfoliosSelect";
import { CcySelect } from "../components/Profile/Prefs";
import { TickerLookup } from "../components/Tx/TickerLookup";
import { txsUploadModal } from "../components/Tx/TxsFields";
import {
  decimalFormatter,
  moneyFormatter,
  percentFormatter
} from "../util/number";

const TabModals: React.FC = () => {
  const [res, setRes] = useState<any>(null);
  const portfDetailsHandler = () => {
    return pipe(
      () => portfolioModal(defaultPortfolio()),
      TE.tapIO((p) => () => setRes(p))
    )();
  };

  const confirmationHandler = () => {
    return pipe(
      () => confirmationModal("yes or maybe not"),
      TE.tapIO((p) => () => setRes(p))
    )();
  };

  const portfolioSelectorHandler = () => {
    return pipe(
      () => portfoliosSelectModal({ id: 123, name: "test" } as GetPortfolio),
      TE.tapIO((p) => () => setRes(p))
    )();
  };

  const txsUploadHandler = () => {
    return pipe(
      () => txsUploadModal("EUR"),
      TE.tapIO((p) => () => setRes(p))
    )();
  };
  return (
    <>
      <SecondaryButton onClick={confirmationHandler}>
        confirmation
      </SecondaryButton>
      <PrimaryButton onClick={portfDetailsHandler}>
        portfolio details
      </PrimaryButton>
      <SecondaryButton onClick={portfolioSelectorHandler}>
        portfolio select
      </SecondaryButton>
      <PrimaryButton onClick={txsUploadHandler}>txs upload</PrimaryButton>
      <br />
      <pre>{JSON.stringify(res, null, 2)}</pre>
    </>
  );
};

const TabSelectors: React.FC = () => {
  const [res, setRes] = useState<any>(null);

  return (
    <>
      <Row>
        <Col>
          Menu &nbsp;
          <PortfolioMenu
            onDelete={() => setRes("delete")}
            onEdit={() => setRes("edit")}
          />
        </Col>
        <Col>
          <CcySelect value={res} onSelect={setRes} />
        </Col>
        <Col>
          <TickerLookup onSelect={setRes} />
        </Col>
      </Row>
      <br />
      <pre>{JSON.stringify(res, null, 2)}</pre>
    </>
  );
};

const TabFormatting: React.FC = () => {
  const money = moneyFormatter("AUD", "fr-FR");
  const decimal = decimalFormatter("de-DE");
  const percent = percentFormatter("de-DE");
  return (
    <ul>
      <li>{money(40123)}</li>
      <li>{decimal(0.012)}</li>
      <li>{percent(0.012, 2)}</li>
    </ul>
  );
};

const RawTestScreen: React.FC = () => {
  useHead({ title: "Assets - Test" });

  return (
    <>
      <Tabs tabs={["Modals", "Menus", "Formatting"]}>
        <TabContent tab={0}>
          <TabModals />
        </TabContent>
        <TabContent tab={1}>
          <TabSelectors />
        </TabContent>
        <TabContent tab={2}>
          <TabFormatting />
        </TabContent>
      </Tabs>
    </>
  );
};

const TestScreen = RawTestScreen;
export { TestScreen };
