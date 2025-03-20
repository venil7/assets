import { useState } from "react";

export const useFormData = <T extends Record<string, any>>(data: T) => {
  const [state, setState] = useState(data);
  const setField =
    <K extends keyof T>(key: K) =>
    (val: T[K]) =>
      setState({ ...state, [key]: val });
  return [state, setField, setState] as const;
};
