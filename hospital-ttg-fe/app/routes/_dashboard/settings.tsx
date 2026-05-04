import { redirect } from "react-router";

export function loader() {
  return redirect("/dashboard/settings/account");
}

export default function SettingsIndexRedirect() {
  return null;
}
