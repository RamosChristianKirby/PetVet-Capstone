import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// useAuthRedirect

const useAuthRedirect = () => {
  const navigate = useNavigate();

  // useContext hook to access the AuthContext for authentication state.
  
  const authContext = useContext(AuthContext);

  useEffect(() => {

    // Checks if the user is authenticated.

    if (authContext?.isAuthenticated) 
      navigate('/dashboard');
    
  }, [authContext?.isAuthenticated, navigate]);
};

export default useAuthRedirect;
