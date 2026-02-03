import { portfolioValidator, type PostPortfolio } from "@darkruby/assets-core";
import { pipe } from "fp-ts/lib/function";
import { Form } from "react-bootstrap";
import { usePartialChange } from "../../hooks/formData";
import { createDialog } from "../../util/modal";
import type { PropsOf } from "../../util/props";
import { createForm, type FieldsProps } from "../Form/Form";
import { FormEdit } from "../Form/FormControl";
import { createModal } from "../Modals/Modal";

type PortfolioFieldsProps = FieldsProps<PostPortfolio>;

const PortfolioFields: React.FC<PortfolioFieldsProps> = ({
  data,
  onChange,
  disabled
}) => {
  const setField = usePartialChange(data, onChange);

  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Name</Form.Label>
        <FormEdit
          value={data.name}
          onChange={setField("name")}
          disabled={disabled}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <FormEdit
          value={data.description}
          onChange={setField("description")}
          disabled={disabled}
        />
      </Form.Group>
    </Form>
  );
};

export const PortfolioForm = createForm<PostPortfolio, PortfolioFieldsProps>(
  PortfolioFields,
  portfolioValidator
);

export const PortfolioModal = createModal<PostPortfolio>(
  PortfolioFields,
  portfolioValidator,
  "Portfolio"
);

export const portfolioModal = (value: PostPortfolio) =>
  pipe(
    { value },
    createDialog<PostPortfolio, PropsOf<typeof PortfolioModal>>(PortfolioModal)
  );
