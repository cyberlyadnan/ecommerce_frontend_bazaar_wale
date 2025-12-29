'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveProductImage } from '@/utils/currency';

interface ProductImage {
  url: string;
  alt?: string;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productTitle: string;
}

export function ProductImageGallery({ images, productTitle }: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;

  if (!images || images.length === 0) {
    return (
      <div className="space-y-4">
        <div className="relative bg-surface rounded-lg overflow-hidden aspect-square">
          <div className="flex h-full items-center justify-center text-foreground/40 text-sm">
            No product image
          </div>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  // Touch handlers for swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        ref={imageContainerRef}
        className="relative bg-surface rounded-lg overflow-hidden aspect-square group"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {currentImage && (
          <Image
            src={resolveProductImage(currentImage.url)}
            alt={currentImage.alt || productTitle}
            fill
            className="object-cover transition-opacity duration-300"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority={currentIndex === 0}
          />
        )}

        {/* Navigation Buttons */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-surface/90 backdrop-blur-sm p-2 md:p-2.5 rounded-full hover:bg-surface active:bg-surface transition-all duration-200 shadow-lg z-10 touch-manipulation"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-surface/90 backdrop-blur-sm p-2 md:p-2.5 rounded-full hover:bg-surface active:bg-surface transition-all duration-200 shadow-lg z-10 touch-manipulation"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs font-medium z-10">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {hasMultipleImages && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 p-3">
          {images.map((img, idx) => (
            <button
              key={img.url + idx}
              type="button"
              onClick={() => goToImage(idx)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                idx === currentIndex
                  ? 'border-primary ring-1 ring-primary/20 scale-105'
                  : 'border-border hover:border-primary/50 hover:scale-105'
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <Image
                src={resolveProductImage(img.url)}
                alt={img.alt || `${productTitle} - Image ${idx + 1}`}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

