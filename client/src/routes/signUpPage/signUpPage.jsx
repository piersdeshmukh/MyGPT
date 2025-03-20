import { SignUp } from '@clerk/clerk-react'
import './signUpPage.css'

const SignUpPage = () => {
  return (
    <div className='signUpPage'><SignUp path="/sign-up" forceRedirectUrl="/dashboard" signInUrl="/sign-in"/></div>
  )
}

export default SignUpPage