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
    ]),
  ]),
] satisfies RouteConfig;
