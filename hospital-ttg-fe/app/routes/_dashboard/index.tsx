import type { Route } from "./+types/index";
import { ChartAreaInteractive } from "~/components/chart-area-interactive"
import { DataTable } from "~/components/data-table"
import { SectionCards } from "~/components/section-cards"
import data from "./data.json"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tổng quan Dashboard | Hospital TTG" },
  ];
}

export default function DashboardIndex() {
  return (
    <>
      <SectionCards />
      <div className="py-2">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </>
  );
}
