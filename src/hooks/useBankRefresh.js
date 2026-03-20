import React from "react";
import { initialiseBankState, subscribeToBankingChanges } from "../services/bankService.js";

export default function useBankRefresh() {
  const [version, setVersion] = React.useState(0);

  React.useEffect(() => {
    initialiseBankState();
    return subscribeToBankingChanges(() => setVersion((value) => value + 1));
  }, []);

  return version;
}
