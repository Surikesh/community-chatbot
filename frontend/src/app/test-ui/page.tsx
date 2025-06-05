'use client'

import { ActivityCard } from '@/components/activities'
import type { Activity } from '@/types'

const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Mountain Trail Hike',
    description: 'A beautiful hiking trail with scenic mountain views and challenging terrain that will test your endurance.',
    type: 'hiking',
    location: {
      id: 'loc1',
      name: 'Mount Wilson',
      latitude: 34.2257,
      longitude: -118.0582,
      country: 'USA',
      region: 'California',
      city: 'Los Angeles'
    },
    difficulty: 'moderate',
    duration: '3-4 hours',
    distance: 8.5,
    elevation: 500,
    tags: ['hiking', 'scenic', 'mountain', 'challenging'],
    images: [
      {
        id: 'img1',
        url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300',
        caption: 'Trail view',
        width: 800,
        height: 600
      },
      {
        id: 'img2',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300',
        caption: 'Mountain peak',
        width: 800,
        height: 600
      }
    ],
    routes: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'City Cycling Route',
    description: 'Urban cycling adventure through downtown with bike lanes and city landmarks.',
    type: 'cycling',
    location: {
      id: 'loc2',
      name: 'Downtown Core',
      latitude: 40.7128,
      longitude: -74.0060,
      country: 'USA',
      region: 'New York',
      city: 'New York'
    },
    difficulty: 'easy',
    duration: '1-2 hours',
    distance: 12.3,
    elevation: 50,
    tags: ['cycling', 'urban', 'beginner-friendly'],
    images: [],
    routes: [],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    title: 'Advanced Rock Climbing',
    description: 'Expert-level climbing route with technical challenges and breathtaking views.',
    type: 'climbing',
    location: {
      id: 'loc3',
      name: 'El Capitan',
      latitude: 37.7341,
      longitude: -119.6370,
      country: 'USA',
      region: 'California',
      city: 'Yosemite'
    },
    difficulty: 'expert',
    duration: '6-8 hours',
    distance: 2.1,
    elevation: 900,
    tags: ['climbing', 'technical', 'expert', 'multi-pitch'],
    images: [
      {
        id: 'img3',
        url: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=600',
        thumbnailUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400&h=300',
        caption: 'Rock wall',
        width: 800,
        height: 600
      }
    ],
    routes: [],
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  },
  {
    id: '4',
    title: 'Lake Kayaking Adventure',
    description: 'Peaceful kayaking on pristine lake waters with wildlife spotting opportunities.',
    type: 'kayaking',
    location: {
      id: 'loc4',
      name: 'Lake Tahoe',
      latitude: 39.0968,
      longitude: -120.0324,
      country: 'USA',
      region: 'California'
    },
    difficulty: 'moderate',
    duration: '2-3 hours',
    distance: 5.7,
    elevation: 0,
    tags: ['kayaking', 'lake', 'wildlife', 'peaceful'],
    images: [
      {
        id: 'img4',
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300',
        caption: 'Lake view',
        width: 800,
        height: 600
      }
    ],
    routes: [],
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z'
  },
  {
    id: '5',
    title: 'Marathon Training Run',
    description: 'Long distance running route perfect for marathon preparation.',
    type: 'running',
    location: {
      id: 'loc5',
      name: 'Central Park',
      latitude: 40.7829,
      longitude: -73.9654,
      country: 'USA',
      region: 'New York',
      city: 'New York'
    },
    difficulty: 'hard',
    duration: '2-3 hours',
    distance: 21.1,
    elevation: 100,
    tags: ['running', 'marathon', 'training', 'endurance'],
    images: [],
    routes: [],
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z'
  }
]

const minimalActivity: Activity = {
  id: '6',
  title: 'Simple Walk',
  description: 'A basic walking activity with minimal data.',
  type: 'hiking',
  location: {
    id: 'loc6',
    name: 'Local Park',
    latitude: 37.7749,
    longitude: -122.4194,
    country: 'USA'
  },
  difficulty: 'easy',
  tags: ['walking'],
  images: [],
  routes: [],
  createdAt: '2024-01-06T00:00:00Z',
  updatedAt: '2024-01-06T00:00:00Z'
}

export default function TestUIPage() {
  const handleActivityClick = (activityId: string) => {
    alert(`Clicked on activity: ${activityId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">ActivityCard UI Test Page</h1>
        
        {/* Section 1: Grid of different activities */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Different Activity Types & Difficulties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onClick={() => handleActivityClick(activity.id)}
              />
            ))}
          </div>
        </section>

        {/* Section 2: Variations */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Component Variations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* With custom class */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Custom Border</h3>
              <ActivityCard
                activity={mockActivities[0]}
                className="border-2 border-blue-500"
                onClick={() => handleActivityClick(mockActivities[0].id)}
              />
            </div>

            {/* Hidden details */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Hidden Details</h3>
              <ActivityCard
                activity={mockActivities[1]}
                showDetails={false}
                onClick={() => handleActivityClick(mockActivities[1].id)}
              />
            </div>

            {/* Minimal data */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Minimal Data</h3>
              <ActivityCard
                activity={minimalActivity}
                onClick={() => handleActivityClick(minimalActivity.id)}
              />
            </div>

            {/* Non-clickable */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Non-clickable</h3>
              <ActivityCard
                activity={mockActivities[2]}
              />
            </div>

            {/* With very long title and description - Test for text cutoff fix */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Long Content (Text Cutoff Fix)</h3>
              <ActivityCard
                activity={{
                  ...mockActivities[3],
                  title: 'City Cycling Route - Urban Adventure Through Downtown Metropolitan Areas',
                  description: 'This is an extremely long description that should demonstrate how the component handles very lengthy text content. It should be properly truncated with ellipsis to maintain the card layout and visual consistency. The description continues to be very long to test the line clamping feature properly.',
                  tags: ['cycling', 'urban', 'beginner-friendly', 'scenic', 'downtown', 'landmarks', 'bike-lanes']
                }}
                onClick={() => handleActivityClick('long-content-test')}
              />
            </div>

            {/* Compact layout */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Compact (Hidden Details)</h3>
              <ActivityCard
                activity={mockActivities[4]}
                showDetails={false}
                className="max-w-sm"
                onClick={() => handleActivityClick(mockActivities[4].id)}
              />
            </div>
          </div>
        </section>

        {/* Section 3: All difficulty levels */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Difficulty Level Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['easy', 'moderate', 'hard', 'expert'] as const).map((difficulty) => (
              <ActivityCard
                key={difficulty}
                activity={{
                  ...mockActivities[0],
                  id: `diff-${difficulty}`,
                  title: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Activity`,
                  difficulty
                }}
                onClick={() => handleActivityClick(`diff-${difficulty}`)}
              />
            ))}
          </div>
        </section>

        {/* Section 4: All activity types */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Activity Type Icons</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(['hiking', 'cycling', 'running', 'skiing', 'climbing', 'swimming', 'kayaking'] as const).map((type) => (
              <ActivityCard
                key={type}
                activity={{
                  ...mockActivities[0],
                  id: `type-${type}`,
                  title: `${type.charAt(0).toUpperCase() + type.slice(1)} Adventure`,
                  type,
                  description: `A wonderful ${type} activity for everyone to enjoy.`
                }}
                showDetails={false}
                onClick={() => handleActivityClick(`type-${type}`)}
              />
            ))}
          </div>
        </section>

        {/* Section 5: Responsive test */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Responsive Layout Test</h2>
          <p className="text-gray-600 mb-4">Resize your browser window to test responsive behavior</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {mockActivities.slice(0, 5).map((activity) => (
              <ActivityCard
                key={`responsive-${activity.id}`}
                activity={activity}
                onClick={() => handleActivityClick(`responsive-${activity.id}`)}
              />
            ))}
          </div>
        </section>

        {/* Section 6: Specific test case for screenshot issue */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Screenshot Issue Test Case</h2>
          <p className="text-gray-600 mb-4">Testing the specific layout from the screenshot with potential text cutoff</p>
          <div className="max-w-md mx-auto">
            <ActivityCard
              activity={{
                id: 'screenshot-test',
                title: 'City Cycling Route',
                description: 'Urban cycling adventure through downtown with bike lanes and city landmarks.',
                type: 'cycling',
                location: {
                  id: 'loc-screenshot',
                  name: 'Downtown Core',
                  latitude: 40.7831,
                  longitude: -73.9712,
                  country: 'USA',
                  region: 'New York',
                  city: 'New York'
                },
                difficulty: 'easy',
                duration: '1-2 hours',
                distance: 12.3,
                elevation: 50,
                tags: ['cycling', 'urban', 'beginner-friendly'],
                images: [
                  {
                    id: 'screenshot-img',
                    url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600',
                    thumbnailUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300',
                    caption: 'City cycling',
                    width: 800,
                    height: 600
                  }
                ],
                routes: [],
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z'
              }}
              onClick={() => handleActivityClick('screenshot-test')}
              showDetails={false}
            />
          </div>
        </section>

        {/* Interactive test section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Interactive Test</h2>
          <p className="text-gray-600 mb-4">Click on any card to see the onClick handler in action</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActivityCard
              activity={mockActivities[0]}
              onClick={() => {
                console.log('Card clicked!', mockActivities[0])
                alert(`You clicked on: ${mockActivities[0].title}`)
              }}
            />
            <ActivityCard
              activity={mockActivities[1]}
              onClick={() => {
                console.log('Card clicked!', mockActivities[1])
                alert(`You clicked on: ${mockActivities[1].title}`)
              }}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
