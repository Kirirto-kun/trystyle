"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Eye, MapPin, Store as StoreIcon } from "lucide-react";
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
  const tDashboard = useTranslations('dashboard');
  const [imageError, setImageError] = useState(false);

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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-3 w-3 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="relative">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
          {product.image_urls && product.image_urls.length > 0 && !imageError ? (
            <img
              src={product.image_urls[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              <div className="text-center">
                <StoreIcon className="h-12 w-12 mx-auto mb-2" />
                <span className="text-sm">No Image</span>
              </div>
            </div>
          )}
        </div>

        {/* Discount Badge */}
        {product.discount_percentage > 0 && (
          <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white">
            -{product.discount_percentage}%
          </Badge>
        )}


      </div>

      <CardContent className="p-4 space-y-3">
        {/* Product Name */}
        <div>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 leading-tight">
            {product.name}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {product.brand}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {renderStars(product.rating)}
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {product.rating.toFixed(1)} ({product.reviews_count})
          </span>
        </div>

        {/* Price */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {product.original_price > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </div>

        {/* Store Info */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <StoreIcon className="h-3 w-3" />
            <span className="truncate">{product.store.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <MapPin className="h-3 w-3" />
            <span>{product.store.city}</span>
          </div>
        </div>

        {/* Category & Sizes */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">
            {product.category}
          </Badge>
          {product.sizes && product.sizes.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {product.sizes.slice(0, 3).join(', ')}
              {product.sizes.length > 3 && '...'}
            </Badge>
          )}
        </div>

        {/* Action Button */}
        <Link 
          href={storeSlug ? `/${storeSlug}/products/${product.id}` : `/dashboard/catalog/products/${product.id}`} 
          className="block w-full"
        >
          <Button className="w-full mt-3 group-hover:bg-gray-900 dark:group-hover:bg-white transition-colors">
            <Eye className="h-4 w-4 mr-2" />
            {tDashboard('catalog.products.viewDetails')}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
} 