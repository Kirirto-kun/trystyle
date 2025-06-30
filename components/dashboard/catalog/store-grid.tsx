"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";
import { useTranslations } from "@/contexts/language-context";
import StoreCard from "./store-card";

interface Store {
  id: number;
  name: string;
  description: string;
  city: string;
  logo_url: string;
  website_url: string;
  rating: number;
  total_products: number;
  created_at: string;
  updated_at: string;
}

interface StoreGridProps {
  stores: Store[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
}

export default function StoreGrid({ stores, loading, error, hasMore, onLoadMore }: StoreGridProps) {
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

  if (loading && stores.length === 0) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="p-6 bg-white dark:bg-gray-800">
              <div className="animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-gray-200 dark:bg-gray-700 h-12 w-12 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4"></div>
                    <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-full"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-2/3"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (stores.length === 0 && !loading) {
    return (
      <Card className="p-8 text-center bg-white dark:bg-gray-800">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {tDashboard('catalog.stores.empty')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {tDashboard('catalog.search.noResults')}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stores Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
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
              tDashboard('catalog.stores.loadMore')
            )}
          </Button>
        </div>
      )}
    </div>
  );
} 