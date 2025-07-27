import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Users, Package, ShoppingCart, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Produtos", href: "/produtos", icon: Package },
  { name: "Pedidos", href: "/pedidos", icon: ShoppingCart },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { logout } = useAuth();

  const NavItems = () => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h1 className="text-xl font-bold text-primary">JPedidos</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col h-full">
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-primary">JPedidos</h2>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                  <NavItems />
                </nav>
                <div className="p-4 border-t border-border">
                  <Button variant="outline" className="w-full" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-64 lg:fixed lg:inset-y-0">
          <div className="flex flex-col h-full bg-card border-r border-border">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-primary">JPedidos</h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
              <NavItems />
            </nav>
            <div className="p-4 border-t border-border">
              <Button variant="outline" className="w-full" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:ml-64 flex-1">
          <main className="p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}