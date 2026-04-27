import { type RouteConfig, index, layout, route, prefix } from "@react-router/dev/routes";

export default [
  // 1. Nhóm Authentication (Login, Register, Forgot Password)
  layout("routes/_auth/layout.tsx", [
    route("login", "routes/_auth/login.tsx"),
  ]),

  // 2. Nhóm Web bình thường (Dành cho bệnh nhân hoặc người truy cập ngoài)
  layout("routes/_main/layout.tsx", [
    index("routes/_main/index.tsx"), // Route: /
    route("about", "routes/_main/about.tsx"), // Route: /about
    route("contact", "routes/_main/contact.tsx"), // Route: /contact
    route("tin-tuc", "routes/_main/tin-tuc.tsx"), // Route: /tin-tuc
    route("tin-tuc/:slug", "routes/_main/tin-tuc.$slug.tsx"), // Route: /tin-tuc/:slug
    route("doi-ngu-chuyen-gia", "routes/_main/doi-ngu-chuyen-gia.tsx"), // Route: /doi-ngu-chuyen-gia
    route("doi-ngu-chuyen-gia/:id", "routes/_main/doi-ngu-chuyen-gia.$id.tsx"), // Route: /doi-ngu-chuyen-gia/:id
    route("ban-lanh-dao", "routes/_main/ban-lanh-dao.tsx"), // Route: /ban-lanh-dao
  ]),

  // 3. Nhóm Dashboard (Dành cho Quản lý / Bác sĩ)
  layout("routes/_dashboard/layout.tsx", [
    ...prefix("dashboard", [
      index("routes/_dashboard/index.tsx"), // Route: /dashboard
      route("settings", "routes/_dashboard/settings.tsx"), // Route: /dashboard/settings
      ...prefix("system", [
        route("menus", "routes/_dashboard/system.menus.tsx"), // Route: /dashboard/system/menus
        route("categories", "routes/_dashboard/system.categories.tsx"), // Route: /dashboard/system/categories
      ]),
      ...prefix("article", [
        route("categories", "routes/_dashboard/article.categories.tsx"),          // Route: /dashboard/article/categories
        route("contents", "routes/_dashboard/article.contents.tsx"),              // Route: /dashboard/article/contents
        route("contents/create", "routes/_dashboard/article.contents.create.tsx"), // Route: /dashboard/article/contents/create
        route("contents/:id/edit", "routes/_dashboard/article.contents.$id.edit.tsx"), // Route: /dashboard/article/contents/:id/edit
      ]),
      route("bookings", "routes/_dashboard/bookings.tsx"),  // Route: /dashboard/bookings
      route("contacts", "routes/_dashboard/contacts.tsx"),  // Route: /dashboard/contacts
      ...prefix("doctors", [
        index("routes/_dashboard/doctors.tsx"),                          // Route: /dashboard/doctors
        route("departments", "routes/_dashboard/doctors.departments.tsx"), // Route: /dashboard/doctors/departments
      ]),
    ]),
  ]),
] satisfies RouteConfig;
