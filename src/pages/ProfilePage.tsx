import React from 'react'
import { useAppSelector } from '../store/hooks'
import { Card } from '../components/atoms/Card'

export const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <Card title="User Profile">
        {user ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-semibold">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">User ID</p>
              <p className="text-lg font-semibold">{user.id}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Please log in to view your profile.</p>
        )}
      </Card>
    </div>
  )
}

