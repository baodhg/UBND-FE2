import React from 'react'
import { LoginForm, GoogleAuthButton } from '../features/authentication'
import { Card } from '../components/atoms/Card'

export const LoginPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto">
      <Card title="Login">
        <LoginForm />
        <div className="mt-4 text-center">
          <p className="text-gray-600 mb-2">or</p>
          <GoogleAuthButton />
        </div>
      </Card>
    </div>
  )
}

