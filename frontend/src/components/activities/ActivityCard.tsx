'use client'

import { memo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, TrendingUp, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActivityCardProps } from '@/types'

/**
 * Activity card component for displaying activity information
 */
export const ActivityCard = memo(function ActivityCard({ 
  activity, 
  onClick, 
  showDetails = true,
  className 
}: ActivityCardProps) {
  const {
    title,
    description,
    type,
    location,
    difficulty,
    duration,
    distance,
    elevation,
    images,
    tags
  } = activity

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200'
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'hard': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'expert': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'hiking': return '🥾'
      case 'cycling': return '🚴'
      case 'running': return '🏃'
      case 'skiing': return '⛷️'
      case 'climbing': return '🧗'
      case 'swimming': return '🏊'
      case 'kayaking': return '🛶'
      default: return '🏃'
    }
  }

  const formatDistance = (dist?: number) => {
    if (!dist) return null
    return dist < 1 ? `${(dist * 1000).toFixed(0)}m` : `${dist.toFixed(1)}km`
  }

  const formatElevation = (elev?: number) => {
    if (!elev) return null
    return `${elev.toFixed(0)}m`
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <Card 
      className={cn(
        "group transition-all duration-200 hover:shadow-lg",
        onClick && "cursor-pointer hover:border-primary/50",
        className
      )}
      onClick={handleClick}
    >
      {/* Header with image */}
      <div className="relative">
        {images.length > 0 && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
            <img
              src={images[0].thumbnailUrl || images[0].url}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
        
        {/* Activity type badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
            <span className="mr-1">{getActivityIcon(type)}</span>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        </div>

        {/* Difficulty badge */}
        <div className="absolute top-2 right-2">
          <Badge 
            variant="outline" 
            className={cn("bg-white/90 backdrop-blur-sm", getDifficultyColor(difficulty))}
          >
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            {title}
          </h3>
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="text-sm truncate">
              {location.city ? `${location.city}, ${location.country}` : location.name}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Description */}
        {showDetails && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {description}
          </p>
        )}

        {/* Activity stats */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
          {duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
          )}
          
          {distance && (
            <div className="flex items-center gap-1">
              <span className="text-lg">📏</span>
              <span>{formatDistance(distance)}</span>
            </div>
          )}
          
          {elevation && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>{formatElevation(elevation)}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {showDetails && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Additional images indicator */}
        {images.length > 1 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="text-sm">📸</span>
            <span>{images.length} photos</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
