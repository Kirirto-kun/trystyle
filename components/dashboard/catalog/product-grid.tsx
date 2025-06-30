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
}

export default function ProductGrid({ products, loading, error, hasMore, onLoadMore, mobileColumns = 2 }: ProductGridProps) {
  const tDashboard = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  if (error) {
    return (
      <Card className="p-8 text-center bg-white dark:bg-gray-800">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {tCommon('common.error')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          {tCommon('buttons.tryAgain')}
        </Button>
      </Card>
    );
  }

  if (loading && products.length === 0) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className={`grid gap-6 ${
          mobileColumns === 1 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="p-4 bg-white dark:bg-gray-800">
              <div className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-1/2"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 h-6 rounded w-1/4"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0 && !loading) {
    return (
      <Card className="p-8 text-center bg-white dark:bg-gray-800">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9l3-3 3 3" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {tDashboard('catalog.products.empty')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {tDashboard('catalog.search.noResults')}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Products Grid */}
      <div className={`grid gap-6 ${
        mobileColumns === 1 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tCommon('buttons.loading')}
              </>
            ) : (
              tDashboard('catalog.products.loadMore')
            )}
          </Button>
        </div>
      )}
    </div>
  );
} 