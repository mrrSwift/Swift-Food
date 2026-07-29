import { useEffect, useRef } from "react";
import { Link } from "wouter";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { ArrowRight, ChefHat, Github } from "lucide-react";
import { OwnerRequestForm } from "@/components/landing/OwnerRequestForm";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero stagger animation
    if (heroRef.current) {
      gsap.from(heroRef.current.querySelectorAll(".hero-animate"), {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });

      gsap.to(".hero-parallax", {
        y: 100,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    // Sections animate on scroll
    sectionRefs.current.forEach((el, index) => {
      if (!el) return;
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 50,
        duration: 0.7,
        delay: index * 0.1,
        ease: "power2.out",
      });
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const features = [
    {
      icon: "Smartphone",
      title: "Mobile-First Design",
      desc: "Guests browse your menu seamlessly on any device.",
    },
    {
      icon: "Globe",
      title: "Multi-Vendor",
      desc: "One platform for all your restaurants and cafes.",
    },
    {
      icon: "ChefHat",
      title: "Easy Management",
      desc: "Update your menu in minutes, not hours.",
    },
    {
      icon: "Users",
      title: "Customer Friendly",
      desc: "Beautiful cards, search, filters – a joy to use.",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors">
      {/* Hero */}
      <div
        ref={heroRef}
        className="relative overflow-hidden px-6 py-20 md:py-32 text-center"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/30 dark:bg-indigo-800/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-200/30 dark:bg-emerald-800/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="flex justify-center mb-6 hero-animate">
            <AnimatedIcon
              iconName="UtensilsCrossed"
              size="xl"
              animation="pulse"
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>
          <h1 className="hero-animate font-display text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-4">
            Swift Food
          </h1>
          <p className="hero-animate text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8">
            Digital menus for cafes and restaurants.
            <br />
            Open source. Fast. Beautiful.
          </p>
          <div className="hero-animate flex justify-center gap-4">
            <Link to="/allRest">
              <Button
                size="lg"
                className="gap-2 bg-slate-900 dark:bg-white dark:text-gray-900 text-white hover:bg-slate-800"
              >
                Explore Menus <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link to="/owner/login">
              <Button size="lg" variant="outline" className="gap-2">
                Owner Login
              </Button>
            </Link>
            <a
              href="https://github.com/mrrSwift/Swift-Food"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="ghost" className="gap-2">
                <Github className="size-5" />
                GitHub
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-slate-900 dark:text-white">
            Why Swift Food?
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Everything you need to display your menu beautifully.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <div
              key={feat.title}
              ref={el => {
                sectionRefs.current[idx] = el;
              }}
              className="glass-card p-6 rounded-3xl text-center hover:scale-105 transition-transform duration-300"
            >
              <div className="flex justify-center mb-4">
                <AnimatedIcon
                  iconName={feat.icon}
                  size="lg"
                  animation="float"
                />
              </div>
              <h3 className="font-semibold text-xl mb-2">{feat.title}</h3>
              <p className="text-muted-foreground">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to action */}
      <div className="bg-slate-900 dark:bg-gray-800 text-white py-16 px-6 text-center">
        <h2 className="font-display text-3xl font-bold mb-4">
          Ready to digitize your menu?
        </h2>
        <p className="text-slate-300 mb-8 max-w-md mx-auto">
          Join hundreds of restaurants already using Swift Food.
        </p>
        <Link to="/owner/login">
          <Button size="lg" variant="secondary" className="gap-2">
            Get Started <ChefHat className="size-5" />
          </Button>
        </Link>
      </div>

      <section className="max-w-4xl mx-auto py-20 px-6">
        <OwnerRequestForm />
      </section>
    </main>
  );
}
