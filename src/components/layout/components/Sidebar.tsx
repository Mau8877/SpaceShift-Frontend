import * as React from "react"
import { useTranslation } from "react-i18next"
import {
  Building01Icon,
  Cancel01Icon,
  DashboardSquare02Icon,
  File02Icon,
  Home01Icon,
  Settings02Icon,
  UserGroupIcon,
} from "hugeicons-react"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const { t } = useTranslation()
  const { setOpenMobile, isMobile } = useSidebar()

  const menuItems = [
    { title: "Home", icon: Home01Icon, to: "/" },
    { title: "Dashboard", icon: DashboardSquare02Icon, to: "/dashboard" },
    {
      title: t("sidebar.menu.inmuebles"),
      icon: Building01Icon,
      to: "/properties",
    },
    {
      title: t("sidebar.menu.inquilinos"),
      icon: UserGroupIcon,
      to: "/tenants",
    },
    { title: t("sidebar.menu.contratos"), icon: File02Icon, to: "/leases" },
    {
      title: t("sidebar.menu.configuracion"),
      icon: Settings02Icon,
      to: "/settings",
    },
  ]

  return (
    <Sidebar collapsible="icon" className="w-[75vw] border-r-0 sm:w-[260px]">
      {isMobile && (
        <SidebarHeader className="flex flex-row items-center justify-between p-4">
          <span className="text-xs font-bold tracking-widest text-primary uppercase">
            {t("sidebar.header.menu")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpenMobile(false)}
            className="h-8 w-8"
          >
            <Cancel01Icon size={20} className="text-muted-foreground" />
          </Button>
        </SidebarHeader>
      )}

      <SidebarContent className={isMobile ? "mt-0" : "mt-4"}>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4">
            {t("sidebar.header.detail")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    onClick={() => isMobile && setOpenMobile(false)}
                  >
                    <Link
                      to={item.to}
                      activeProps={{
                        className: "bg-primary/10 text-primary font-bold",
                      }}
                    >
                      <item.icon size={20} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
