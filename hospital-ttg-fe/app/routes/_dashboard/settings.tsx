import { redirect } from "react-router";

export function loader() {
  return redirect("/dashboard/profile");
}

export default function SettingsIndexRedirect() {
  return null;
}
