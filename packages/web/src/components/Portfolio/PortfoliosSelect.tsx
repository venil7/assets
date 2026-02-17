import { type GetPortfolio, type Identity } from "@darkruby/assets-core";
import { defaultValidator } from "@darkruby/assets-core/src/validation/util";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { withProps } from "../../decorators/props";
import { getPortfolios } from "../../services/portfolios";
import { createDialog } from "../../util/modal";
import type { PropsOf } from "../../util/props";
import { createForm, type FieldsProps } from "../Form/Form";
import { Select } from "../Form/Select";
import { createModal } from "../Modals/Modal";

const PortfoliosSelect = pipe(
  Select<GetPortfolio>,
  withProps({
    toValue: (p) => String(p.id),
    toLabel: (p) => p.name,
    onIdentify: (id, candidate) => candidate.id == Number(id)
  })
);

export type PortfoliosSelectFieldsProps = Identity<FieldsProps<GetPortfolio>>;

export const PortfoliosSelectFields: React.FC<PortfoliosSelectFieldsProps> = ({
  data: portdolio,
  onChange,
  disabled
}) => {
  const [portfolios, setPortfolios] = useState<GetPortfolio[]>([]);
  useEffect(() => {
    pipe(getPortfolios(), TE.map(setPortfolios))();
  }, []);

  return (
    <Form>
      <Form.Group className="mb-3">
        <PortfoliosSelect
          value={portdolio}
          onSelect={onChange}
          disabled={disabled}
          options={portfolios}
        />
      </Form.Group>
    </Form>
  );
};

export const PortfoliosSelectForm = createForm<
  GetPortfolio,
  PortfoliosSelectFieldsProps
>(PortfoliosSelectFields, defaultValidator);

export const PortfoliosSelectModal = createModal<
  GetPortfolio,
  PortfoliosSelectFieldsProps
>(PortfoliosSelectFields, defaultValidator, "Select Portfolio");

export const portfoliosSelectModal = (value: GetPortfolio) =>
  pipe(
    { value },
    createDialog<GetPortfolio, PropsOf<typeof PortfoliosSelectModal>>(
      PortfoliosSelectModal
    )
  );
