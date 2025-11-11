import React from 'react'
import { Card } from '../components/atoms/Card'

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-gray-800">Welcome to My App</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Feature 1">
          <p className="text-gray-600">Description of feature 1</p>
        </Card>
        <Card title="Feature 2">
          <p className="text-gray-600">Description of feature 2</p>
        </Card>
        <Card title="Feature 3">
          <p className="text-gray-600">Description of feature 3</p>
        </Card>
      </div>
    </div>
  )
}

