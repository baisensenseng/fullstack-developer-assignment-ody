export const authTokenStorageKey = 'ody.auth.token' as const;

export const dashboardRoutes = {
  home: '/',
  orders: '/orders',
  menu: '/menu',
  crm: '/crm',
  settings: '/settings',
  uiLibrary: '/ui-library'
} as const;

export type DashboardRouteKey = keyof typeof dashboardRoutes;
export type DashboardRoutePath = typeof dashboardRoutes[DashboardRouteKey];
