"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "@/contexts/language-context";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price: number;
  category: string;
  brand: string;
  sizes: string[];
  colors: string[];
  image_urls: string[];
  rating: number;
  reviews_count: number;
  stock_quantity: number;
  is_active: boolean;
  discount_percentage: number;
  is_in_stock: boolean;
  store: {
    id: number;
    name: string;
    city: string;
    logo_url: string;
    rating: number;
  };
  created_at: string;
}

interface ProductCardProps {
  product: Product;
  storeSlug?: string;
}

export default function ProductCard({ product, storeSlug }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [hoverImage, setHoverImage] = useState(false);

  // Reset image error when product changes
  useEffect(() => {
    setImageError(false);
  }, [product.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('kk-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get the second image for hover effect
  const hasSecondImage = product.image_urls && product.image_urls.length > 1;
  const currentImageUrl = hoverImage && hasSecondImage ? product.image_urls[1] : product.image_urls[0];

  return (
    <Link 
      href={storeSlug ? `/${storeSlug}/products/${product.id}` : `/dashboard/catalog/products/${product.id}`} 
      className="group block w-full"
    >
      <div className="w-full">
        {/* Product Image */}
        <div 
          className="relative aspect-[3/4] overflow-hidden bg-gray-50 dark:bg-gray-900 mb-3"
          onMouseEnter={() => setHoverImage(true)}
          onMouseLeave={() => setHoverImage(false)}
        >
          {product.image_urls && product.image_urls.length > 0 && !imageError ? (
            <img
              src={currentImageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.02]"
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium">NO IMAGE</span>
                </div>
              </div>
            </div>
          )}

          {/* Sale Badge - Only if there's a discount */}
          {product.discount_percentage > 0 && (
            <div className="absolute top-2 left-2">
              <span className="inline-block bg-black text-white text-xs font-medium px-2 py-1 uppercase tracking-wide">
                SALE
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-1">
          {/* Product Name */}
          <h3 className="text-sm text-gray-900 dark:text-white font-normal leading-tight line-clamp-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {product.original_price > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
} 