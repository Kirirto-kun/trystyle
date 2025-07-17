"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";
import { useTranslations } from "@/contexts/language-context";
import ProductCard from "./product-card";

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

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  mobileColumns?: 1 | 2;
  storeSlug?: string;
}

export default function ProductGrid({ products, loading, error, hasMore, onLoadMore, mobileColumns = 2, storeSlug }: ProductGridProps) {
  const tDashboard = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  if (error) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="p-16 text-center mx-auto max-w-lg">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-6" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            {tCommon('common.error')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="bg-black text-white hover:bg-gray-800 border-black">
            {tCommon('buttons.tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  if (loading && products.length === 0) {
    return (
      <div className="w-full space-y-8">
        {/* Loading skeleton */}
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className={`grid gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:gap-x-6 lg:gap-y-10 ${
            mobileColumns === 1 
              ? 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7' 
              : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7'
          }`}>
            {Array.from({ length: 14 }).map((_, index) => (
              <div key={index} className="w-full">
                <div className="animate-pulse">
                  <div className="bg-gray-100 dark:bg-gray-800 aspect-[3/4] rounded-none mb-3"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-100 dark:bg-gray-800 h-4 rounded w-4/5"></div>
                    <div className="bg-gray-100 dark:bg-gray-800 h-4 rounded w-2/5"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0 && !loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="p-16 text-center mx-auto max-w-lg">
          <div className="text-gray-300 dark:text-gray-600 mb-8">
            <div className="w-24 h-24 mx-auto border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">NO PRODUCTS</span>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            {tDashboard('catalog.products.empty')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {tDashboard('catalog.search.noResults')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-12">
      {/* Products Grid */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className={`grid gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:gap-x-6 lg:gap-y-10 ${
          mobileColumns === 1 
            ? 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7' 
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7'
        }`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} storeSlug={storeSlug} />
          ))}
        </div>
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="outline"
            size="lg"
            className="min-w-48 bg-black text-white hover:bg-gray-800 border-black uppercase tracking-wide font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                LOADING...
              </>
            ) : (
              'LOAD MORE'
            )}
          </Button>
        </div>
      )}
    </div>
  );
} 