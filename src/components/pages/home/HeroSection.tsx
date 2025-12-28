'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const heroSlides = [
  {
    id: 1,
    title: 'Premium Quality Products',
    subtitle: 'Shop the Best',
    description: 'Discover thousands of high-quality products from verified suppliers. Everything you need for your business in one place.',
    cta: 'Shop Now',
    ctaLink: '/products',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop&q=80',
  },
  {
    id: 2,
    title: 'Industrial Equipment & Machinery',
    subtitle: 'Professional Tools',
    description: 'Find the best industrial equipment and machinery from trusted manufacturers. Quality guaranteed for your business needs.',
    cta: 'Browse Equipment',
    ctaLink: '/products',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1920&h=1080&fit=crop&q=80',
  },
  {
    id: 3,
    title: 'Electronics & Components',
    subtitle: 'Latest Technology',
    description: 'Get access to the latest electronics and components from top brands. Stay ahead with cutting-edge technology.',
    cta: 'Explore Electronics',
    ctaLink: '/products',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1920&h=1080&fit=crop&q=80',
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentSlideData = heroSlides[currentSlide];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Hero Slider with Slide Effect */}
      <div className="relative h-[400px] sm:h-[500px] md:h-[570px] overflow-hidden">
        {/* Slides Container */}
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {heroSlides.map((slide, index) => (
            <div key={slide.id} className="min-w-full h-full relative">
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  quality={90}
                  className="object-cover"
                  sizes="100vw"
                />
                
                {/* Light Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
              </div>

              {/* Text Overlay Content - Centered */}
              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                <div className="flex items-center justify-center h-full">
                  <div className="max-w-3xl text-center">
                    {/* Subtitle */}
                    <p className="text-sm sm:text-base md:text-lg font-medium text-white/90 uppercase tracking-wide mb-3">
                      {slide.subtitle}
                    </p>

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 sm:mb-6">
                      {slide.title}
                    </h1>

                    {/* Description */}
                    <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8">
                      {slide.description}
                    </p>

                    {/* CTA Button */}
                    <Link
                      href={slide.ctaLink}
                      className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <span>{slide.cta}</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 shadow-lg z-20 flex items-center justify-center"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 shadow-lg z-20 flex items-center justify-center"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? 'w-8 h-2 bg-white'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
