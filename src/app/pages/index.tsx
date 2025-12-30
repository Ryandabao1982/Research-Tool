import { Navigate } from 'react-router-dom';
import Layout from '../layout';

export default function HomePage() {
  return (
    <Layout>
      <Navigate to="/dashboard" replace />
    </Layout>
  );
}
