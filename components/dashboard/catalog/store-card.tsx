"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Package, ExternalLink, Store as StoreIcon } from "lucide-react";
import { useTranslations } from "@/contexts/language-context";
import Link from "next/link";
import { Store } from "@/lib/types";
import { generateSlug } from "@/lib/utils";

interface StoreCardProps {
  store: Store;
}

export default function StoreCard({ store }: StoreCardProps) {
  const tDashboard = useTranslations('dashboard');

  // Fallback: если slug undefined, null или пустая строка, генерируем из названия
  const storeSlug = (store.slug && store.slug.trim()) || generateSlug(store.name);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="p-6 space-y-4">
        {/* Store Header */}
        <div className="flex items-start gap-4">
          {/* Store Logo */}
          <div className="flex-shrink-0">
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={`${store.name} logo`}
                className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <StoreIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>

          {/* Store Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
              {store.name}
            </h3>
            
            {/* Location */}
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {store.city}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                {renderStars(store.rating)}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {store.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {store.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
            {store.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {store.total_products} {tDashboard('catalog.products.title').toLowerCase()}
            </span>
          </div>
          
          <Badge variant="outline" className="text-xs">
            {tDashboard('catalog.stores.rating')}: {store.rating.toFixed(1)}
          </Badge>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-2 pt-2">
          <Link href={`/${storeSlug}`} className="block">
            <Button className="w-full group-hover:bg-gray-900 dark:group-hover:bg-white transition-colors">
              <StoreIcon className="h-4 w-4 mr-2" />
              {tDashboard('catalog.stores.viewStore')}
            </Button>
          </Link>
          
          {store.website_url && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(store.website_url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {tDashboard('catalog.stores.website')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 