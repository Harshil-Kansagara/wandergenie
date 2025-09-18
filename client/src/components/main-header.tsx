import LanguageSelector from "@/components/language-selector";
import CurrencySelector from "@/components/currency-selector";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function MainHeader() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile sidebar trigger */}
          <div className="md:hidden">
            <SidebarTrigger />
          </div>

          {/* Placeholder for breadcrumbs or page title if needed */}
          <div className="hidden md:block" />

          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <CurrencySelector />
          </div>
        </div>
      </div>
    </header>
  );
}
