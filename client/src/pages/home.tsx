import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Compass, Map as MapIcon, Backpack } from "lucide-react";
import { ApiClient } from "@/lib/api-client";

const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL);

const fetchPersonas = () => apiClient.get("/api/personas");

export default function Home() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const handleStartAdventure = () => {
    setLocation("/quiz");
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-secondary text-white py-20 lg:py-32">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&h=1380')`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              {t('hero_headline')}
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              {t('hero_subheadline')}
            </p>
            <Button onClick={handleStartAdventure} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6">
              {t('hero_cta')}
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{t('how_it_works_title')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Compass className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('how_it_works_step1_title')}</h3>
              <p className="text-muted-foreground">
                {t('how_it_works_step1_desc')}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <MapIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('how_it_works_step2_title')}</h3>
              <p className="text-muted-foreground">
                {t('how_it_works_step2_desc')}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Backpack className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('how_it_works_step3_title')}</h3>
              <p className="text-muted-foreground">
                {t('how_it_works_step3_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Personas Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{t('personas_title')}</h2>
            <p className="text-lg text-muted-foreground">{t('personas_desc')}</p>
          </div>
          <PersonasGrid />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <Link href="/" className="flex items-center space-x-2 mb-4 justify-center hover:opacity-80 smooth-transition">
                <Compass className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-background">
                  WanderGenie
                </span>
              </Link>
          <ul className="flex justify-center space-x-6 mb-8">
            <li>
              <Link href="/about" className="hover:text-background/80 smooth-transition">{t('footer_about_us')}</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-background/80 smooth-transition">{t('footer_contact')}</Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-background/80 smooth-transition">{t('footer_privacy_policy')}</Link>
            </li>
          </ul>
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:opacity-90 smooth-transition text-lg px-8 py-6 mb-8">
            <Link href="/quiz">
              {t('footer_final_cta')}
            </Link>
          </Button>
          <div className="border-t border-background/20 pt-8">
            <p className="text-background/60 text-sm">&copy; 2024 WanderGenie. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

function PersonasGrid() {
  const { data: personas, isLoading: isLoadingPersonas } = useQuery({
    queryKey: ["personas"],
    queryFn: fetchPersonas,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isLoadingPersonas) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={`skeleton-persona-${index}`}>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Skeleton className="w-20 h-20 rounded-full mb-4" />
              <Skeleton className="h-4 mb-2 w-4/5" />
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {(personas as any[])?.map((persona: any) => (
        <Card key={persona.id} className="overflow-hidden elevation-2 hover:elevation-4 smooth-transition group cursor-pointer">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <img src={persona.icon_url} alt={persona.name} className="w-20 h-20 mb-4" />
            <h3 className="font-semibold text-foreground mb-2" data-testid={`text-persona-name-${persona.id}`}>
              {persona.name}
            </h3>
            <p className="text-sm text-muted-foreground">{persona.tagline}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
