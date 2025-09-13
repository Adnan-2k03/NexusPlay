import { LandingPage } from '../LandingPage';

export default function LandingPageExample() {
  return (
    <LandingPage
      onLogin={() => {
        console.log('Login triggered');
        window.location.href = '/api/login';
      }}
    />
  );
}