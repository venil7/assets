import { useContext } from "react";
import { createStoreContext } from "../stores/store";

export const [store, StoreContext] = createStoreContext();

export const useStore = () => {
  return useContext(StoreContext);
};
