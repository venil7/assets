import * as React from "react";
import { Danger } from "./Alert";

type FormErrorProps = {
  errors: string[];
  valid: boolean;
};

export const FormErrors: React.FC<FormErrorProps> = ({
  errors,
  valid,
}: FormErrorProps) => {
  return (
    <Danger hidden={valid} className="mt-3">
      <ul>
        {errors.map((e, idx) => (
          <li key={idx}>{e}</li>
        ))}
      </ul>
    </Danger>
  );
};
