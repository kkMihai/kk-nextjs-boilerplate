import DashWrapper from '@/components/dashboard/DashWrapper.jsx';
import Auth from '@/Auth.js';

export default function Dashboard({ session }) {
  return (
    <DashWrapper session={session}>
      <div className="rounded-lg border bg-card p-4">Card 1</div>
      <div className="rounded-lg border bg-card p-4">Card 2</div>
      <div className="rounded-lg border bg-card p-4">Card 3</div>
      <div className="rounded-lg border bg-card p-4">Card 4</div>
    </DashWrapper>
  );
}

export async function getServerSideProps(context) {
  const auth = await new Auth(context).init();

  return auth.requireAuth(async (ctx, { session }) => ({
    props: {
      session,
    },
  }))(context);
}
