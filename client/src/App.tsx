import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import OwnerLogin from "@/pages/OwnerLogin";
import OwnerWorkspace from "@/pages/OwnerWorkspace";
import RestaurantStorefront from "@/pages/RestaurantStorefront";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ComponentShowcase from "./pages/ComponentShowcase";
import LandingPage from "./pages/LandingPage";
import AdminWorkspace from "./pages/AdminWorkspace";
import PaymentVerify from "./pages/PaymentVerify";
import { LocaleProvider } from "./contexts/LocaleContext";
import OrderStatusPage from "./pages/OrderStatusPage";

function PublicRestaurantRoute() {
  return <RestaurantStorefront />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/ComponentShowcase" component={ComponentShowcase} />
      <Route path="/allRest" component={Home} />
      <Route path="/r/:restaurantSlug" component={PublicRestaurantRoute} />
      <Route path="/owner/login" component={OwnerLogin} />
      <Route path="/owner" component={OwnerWorkspace} />
      <Route path="/admin" component={AdminWorkspace} />
      <Route path="/payment/verify" component={PaymentVerify} />
      <Route path="/order/:orderId" component={OrderStatusPage} />
      <Route
        path="/owner/restaurants/:restaurantId/overview"
        component={OwnerWorkspace}
      />
      <Route
        path="/owner/restaurants/:restaurantId/settings"
        component={OwnerWorkspace}
      />
      <Route
        path="/owner/restaurants/:restaurantId/categories"
        component={OwnerWorkspace}
      />
      <Route
        path="/owner/restaurants/:restaurantId/menu"
        component={OwnerWorkspace}
      />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LocaleProvider >
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </LocaleProvider>
    </ErrorBoundary>
  );
}

export default App;
