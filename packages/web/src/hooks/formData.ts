import { useState } from "react";

export const usePartialState = <T extends Record<string, any>>(data: T) => {
  const [state, setState] = useState(data);
  const setField =
    <K extends keyof T>(key: K) =>
    (val: T[K]) =>
      setState({ ...state, [key]: val });
  return [state, setField, setState] as const;
};

export const usePartialChange = <T extends Record<string, any>>(
  data: T,
  onChange: (t: T) => any
) => {
  const handlePartyailChange =
    <K extends keyof T>(key: K) =>
    (val: T[K]) =>
      onChange({ ...data, [key]: val });
  return handlePartyailChange;
};
