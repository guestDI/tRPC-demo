// client/src/App.tsx
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './utils/trpc';
import { UsersList } from './components/UsersList';
import { AddUserForm } from './components/AddUserForm';
import { styles } from './styles';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Create a tRPC client
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:4000/trpc',
    }),
  ],
});

function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <div style={styles.container}>
          <h1 style={styles.header}>tRPC Demo</h1>
          <div style={styles.mainContent}>
            <div style={styles.usersSection}>
              <UsersList />
            </div>
            <div style={styles.formSection}>
              <AddUserForm />
            </div>
          </div>
        </div>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;