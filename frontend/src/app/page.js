import { redirect } from 'next/navigation';

export default function Home() {
  // Always redirect to dashboard or login
  redirect('/dashboard');
}
