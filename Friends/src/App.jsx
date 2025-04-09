import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import LoginForm from './modules/Form/LoginForm';
import Dashboard from './modules/Dashboard/Dashboard';
import MobileDashboard from './modules/MobileDashboard/MobileDashboard';


function ProtectRoute({ children, auth = false }) {
  debugger
  const isLoggedIn = localStorage.getItem('user:token') !== null || false;
  // console.log(isLoggedIn)
  if (!isLoggedIn && auth) {
    // Redirect to an absolute path
    return <Navigate to="/users/sign_in/" />;
    // return <LoginForm isSignIn={true} />
  } else if (isLoggedIn && ['/users/sign_in/', '/users/sign_up/'].includes(window.location.pathname)) {
    // console.log(isLoggedIn)
    return <Navigate to={'/'} />
  }
  return children;
}


function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/users/sign_in/" element={
          <ProtectRoute>
            <LoginForm isSignIn={true} />
          </ProtectRoute>
        } />
        <Route path="/users/sign_up/" element={
          <ProtectRoute >
            <LoginForm isSignIn={false} />
          </ProtectRoute>
        } />

        {/* Protected Route */}
        <Route
          path="/"
          element={
            <ProtectRoute auth={true}>
              <Dashboard />
            </ProtectRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
