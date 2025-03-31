import axios from "axios"
import { ChangeEvent, FormEvent, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import useAuthRedirect from "../../../hooks/use-auth-redirect"
import PasswordInput from "../PasswordInput"
import AuthLayout from "../Layout"
import Input from "../Input"

// SignUp

const SignUp = () => {
  useAuthRedirect()
  const navigate = useNavigate()
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [address, setAddress] = useState<string>("")
  const [contact, setContact] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [passwordError, setPasswordError] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")

  // handleSubmit

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    // Preventing the default form submission behavior.

    event.preventDefault()

    // Validating if the password and confirm password fields match.

    if (password !== confirmPassword) {
      // Setting a password error if they do not match.

      setPasswordError("Passwords do not match")
      return
    }

    // Clearing any previous password errors.

    setPasswordError("")

    // Preparing the user data to be sent in the signup request.

    const userData = { name, email, address, contact, password }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/signup",
        userData
      )

      if (response.status === 201) {
        // Navigating to the login page after a successful signup. Could also navigate directly to dashboard.

        setTimeout(() => navigate("/auth/login"), 100)
      } else {
        console.error("Signup error:", response.data.message)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error during signup:",
          error.response?.data || error.message
        )
      } else {
        console.error("Error during signup:", error)
      }
    }
  }

  return (
    <AuthLayout title="Sign Up">
      <p className="text-sm font-semibold text-neutral-400 mt-2 mb-5 text-center">
        Connect with the Best in Pet Care – Sign Up Now
      </p>
      <form className="text-center" onSubmit={handleSubmit}>
        <Input
          name="name"
          placeholder="Name"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
        />
        <Input
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
        />
        <Input
          name="address"
          placeholder="Address"
          value={address}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setAddress(e.target.value)
          }
        />
        <Input
          name="contact"
          placeholder="Contact"
          value={contact}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setContact(e.target.value)
          }
        />
        <PasswordInput
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
        />
        <PasswordInput
          name="confirmPassword"
          placeholder="Repeat Password"
          value={confirmPassword}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setConfirmPassword(e.target.value)
          }
        />
        {passwordError && (
          <p className="text-red-500 text-sm">{passwordError}</p>
        )}
        <button
          type="submit"
          className="block w-full bg-blue-600 hover:bg-blue-600/90 mt-4 py-2 rounded-md text-white font-semibold mb-2"
        >
          Sign Up
        </button>
        <div className="text-left">
          <span className="text-sm ml-2">Already have an account?</span>
          <Link to="/auth/login">
            <span className="text-sm ml-1 text-blue-500 hover:text-blue-600 cursor-pointer underline">
              Login
            </span>
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}

export default SignUp
