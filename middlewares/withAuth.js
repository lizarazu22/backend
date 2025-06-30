import { useEffect } from 'react';
import { useRouter } from 'next/router';

const withAuth = (WrappedComponent, allowedRoles = []) => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token || !user) {
        router.replace('/login');
        return;
      }

      if (allowedRoles.length && !allowedRoles.includes(user.rol)) {
        router.replace('/');
        return;
      }
    }, []);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
