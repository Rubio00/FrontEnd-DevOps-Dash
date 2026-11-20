export type IconName =
  | "alert"
  | "branch"
  | "check"
  | "chart"
  | "close"
  | "employees"
  | "eye"
  | "home"
  | "lock"
  | "menu"
  | "payroll"
  | "plus"
  | "roles"
  | "search"
  | "store"
  | "truck"
  | "users"
  | "wallet";

const iconPaths: Record<IconName, string> = {
  alert: "M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z M12 9v4 M12 17h.01",
  branch: "M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  check: "M20 6 9 17l-5-5",
    chart: "M3 3v18h18 M7 15l4-4 3 3 5-6",
  close: "M18 6 6 18 M6 6l12 12",
  employees: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z M9 22V12h6v10",
  lock: "M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4 M12 15v2",
  menu: "M4 6h16 M4 12h16 M4 18h16",
  payroll: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  plus: "M12 5v14 M5 12h14",
  roles: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z M9 12l2 2 4-4",
  search: "M21 21l-4.35-4.35 M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  store: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z M9 22V12h6v10",
  truck: "M1 3h15v13H1z M16 8h4l3 3v5h-7z M8 18.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z M21 18.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  wallet: "M3 6h16a2 2 0 0 1 2 2v11H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14 M16 12h5",
};

export function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={iconPaths[name]} />
    </svg>
  );
}