import { Button } from '../../../components/atoms/Button'

export const GoogleAuthButton = () => {
  const handleGoogleAuth = () => {
    // Implement Google OAuth logic here
    console.log('Google auth clicked')
  }

  return (
    <Button onClick={handleGoogleAuth} variant="outline">
      Sign in with Google
    </Button>
  )
}

