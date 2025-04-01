import { type PostPortfolio } from "@darkruby/assets-core";
import { Form } from "react-bootstrap";
import { usePartialChange } from "../../hooks/formData";
import { FormEdit } from "../Form/FormControl";

export type PortfolioFormProps = {
  portfolio: PostPortfolio;
  onChange: (p: PostPortfolio) => void;
};

export const PortfolioForm: React.FC<PortfolioFormProps> = ({
  portfolio,
  onChange,
}) => {
  const setField = usePartialChange(portfolio, onChange);

  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Name</Form.Label>
        <FormEdit value={portfolio.name} onChange={setField("name")} />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <FormEdit
          value={portfolio.description}
          onChange={setField("description")}
        />
      </Form.Group>
    </Form>
  );
};
