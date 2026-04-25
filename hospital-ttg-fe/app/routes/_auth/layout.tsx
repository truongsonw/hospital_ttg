import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Outlet />
    </div>
  );
}
