// saveUserDetails

export const saveUserDetails = (user: { email: string, name: string, id: string }) => {
  localStorage.setItem('userEmail', user.email);
  localStorage.setItem('userName', user.name);
  localStorage.setItem('userId', user.id);
};

// getUserDetails

export const getUserDetails = () => {
  return {
    email: localStorage.getItem('userEmail') || '',
    name: localStorage.getItem('userName') || ''
  };
};

// clearUserDetails

export const clearUserDetails = () => {
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
};
