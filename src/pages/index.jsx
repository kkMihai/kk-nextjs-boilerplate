import Layout from '@/components/landingpage/Layout.jsx';
import Hero from '@/components/landingpage/sections/Hero.jsx';
import Auth from '@/Auth.js';

export default function Home({ session }) {
  return (
    <Layout session={session}>
      <Hero />
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { session } = await new Auth(context).init();

  return {
    props: {
      session,
    },
  };
}
