import React from "react";
import { useSearchParams } from "react-router-dom";
import LoginPage from "../auth/LoginPage.jsx";
import ShopPage from "../shop/ShopPage.jsx";

export default function EntryPage() {
  const [searchParams] = useSearchParams();

  if (searchParams.get("shop") === "1") {
    return <ShopPage />;
  }

  return <LoginPage />;
}
