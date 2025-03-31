import axios from 'axios';
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from "react-router-dom";
import useAuthRedirect from '../../../hooks/use-auth-redirect';
import { saveUserDetails } from '../../../context/UserUtils';
import PasswordInput from "../PasswordInput";
import AuthLayout from "../Layout";
import Input from "../Input";

const Login = () => {
  useAuthRedirect();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // handleSubmit

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Construct the login data.

    const loginData = { email, password };

    try {
      const response = await axios.post('http://localhost:5000/api/users/login', loginData);

      // Check if the response is successful.

      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        saveUserDetails({
          email: response.data.result.email,
          name: response.data.result.name,
          id: response.data.result.id
        });

        const userDetails = {
          id: response.data.result.id,
          role: response.data.result.role
        };
        localStorage.setItem('userDetails', JSON.stringify(userDetails));

        // Redirect to the dashboard after a successful login.

        setTimeout(() => navigate('/dashboard'), 100);
      } else {
        console.error('Login failed:', response.data.message);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error during login:', error.response?.data || error.message);
      } else {
        console.error('Error during login:', error);
      }
    }
  };

  return (
    <AuthLayout title="Get Started">
      <p className="text-sm font-semibold text-neutral-400 mt-2 mb-5 text-center">
        Connect with the Best in Pet Care – Sign In Now
      </p>
      <form className="text-center" onSubmit={handleSubmit}>
        <Input name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordInput name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="block w-full bg-blue-600 hover:bg-blue-600/90 mt-4 py-2 rounded-md text-white font-semibold mb-2">
          Login
        </button>
        <div className="text-left">
          <span className="text-sm ml-2">Don't have an account?</span>
          <Link to="/auth/signup">
            <span className="text-sm ml-1 text-blue-500 hover:text-blue-600 cursor-pointer underline">Sign Up</span>
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
