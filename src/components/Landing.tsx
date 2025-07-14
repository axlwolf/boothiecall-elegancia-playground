import { useState, useEffect } from "react";
import { Camera, Sparkles, Image, Zap, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroGallery from "@/assets/hero-gallery.jpg";

interface LandingProps {
  onStart: () => void;
}

const Landing = ({ onStart }: LandingProps) => {
  const [shootingStars, setShootingStars] = useState<
    Array<{ id: number; delay: number }>
  >([]);

  useEffect(() => {
    // Create shooting stars with random delays
    const stars = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      delay: Math.random() * 5000 + 1000,
    }));
    setShootingStars(stars);
  }, []);

  const features = [
    {
      icon: Camera,
      title: "Professional Capture",
      description: "High-quality photos with countdown timer",
    },
    {
      icon: Sparkles,
      title: "Luxury Filters",
      description: "15+ premium filter effects",
    },
    {
      icon: Image,
      title: "Custom Layouts",
      description: "Multiple photo strip designs",
    },
    {
      icon: Zap,
      title: "GIF Creation",
      description: "Animated strips with motion",
    },
    {
      icon: Download,
      title: "Instant Download",
      description: "PNG & GIF export options",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gallery Background with Hero Image */}
      <div className="gallery-background" />
      <div
        className="absolute inset-0 opacity-5 bg-center bg-cover"
        style={{ backgroundImage: `url(${heroGallery})` }}
      />

      {/* Shooting Stars */}
      {shootingStars.map((star) => (
        <div
          key={star.id}
          className="shooting-star"
          style={{
            animationDelay: `${star.delay}ms`,
            top: `${10 + Math.random() * 30}%`,
          }}
        />
      ))}

      <div className="container-elegancia min-h-screen flex flex-col justify-center items-center relative z-10">
        {/* Main Logo and Branding */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="mb-8">
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-cinzel font-bold text-glow mb-4">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                BoothieCall
              </span>
            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-cinzel font-medium text-gold-300 mb-2">
              Playground
            </h2>
            <p className="text-base sm:text-lg md:text-xl font-montserrat text-muted-foreground max-w-2xl mx-auto px-4">
              Where luxury meets photography
            </p>
          </div>

          {/* Hero Image Placeholder */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto photo-frame animate-float">
            <div className="w-full h-full bg-gradient-card rounded-lg flex items-center justify-center">
              <Camera className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="animate-slide-up animate-stagger-5 px-4 mb-16">
          <Button
            onClick={onStart}
            className="btn-elegancia text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 animate-pulse-glow"
          >
            <Camera className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
            Start Playground
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-12 w-full max-w-6xl px-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`card-elegancia p-4 sm:p-6 text-center animate-scale-in animate-stagger-${
                index + 1
              }`}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <h3 className="font-cinzel font-semibold text-sm sm:text-base text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-montserrat">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 text-center animate-fade-in animate-stagger-5 px-4">
          <p className="text-xs sm:text-sm text-muted-foreground font-montserrat">
            Professional photo strips • Mobile optimized • Instant download
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
