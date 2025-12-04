"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useTranslations } from "@/contexts/language-context";

// Mock component - no API calls needed

interface ReviewsSectionProps {
  productId: number;
}

export default function ReviewsSection({ productId }: ReviewsSectionProps) {
  const tDashboard = useTranslations('dashboard');

  return (
    <div className="space-y-6">
      {/* Empty State - Always shown */}
      <Card className="p-8 text-center">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <Star className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {tDashboard('catalog.reviews.empty')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Будьте первым, кто оставит отзыв о этом товаре!
        </p>
      </Card>
    </div>
  );
} 