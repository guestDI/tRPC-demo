# tRPC Demo Application

A full-stack TypeScript application demonstrating tRPC integration between a React client and Express server.

## How It Works

• **Type-Safe API Layer**: tRPC creates a type-safe API layer where TypeScript types are shared between client and server, eliminating the need for manual type definitions or API documentation.

• **Zero-Config Setup**: The setup requires minimal configuration - just define your procedures on the server and use them directly in your React components with full type inference.

• **Real-Time Type Inference**: As you define your API procedures on the server, the client automatically gets type definitions, enabling autocomplete and type checking in your IDE.

• **Built-in Data Validation**: Uses Zod for runtime validation of API inputs, ensuring data integrity at both client and server levels.

• **Efficient Data Fetching**: Leverages React Query under the hood for automatic caching, background updates, and optimistic updates.

• **Seamless Error Handling**: Provides type-safe error handling with automatic error propagation from server to client.

• **No REST/GraphQL Overhead**: Eliminates the need for REST endpoints or GraphQL schemas while maintaining type safety and developer experience.

## Architecture

The application consists of two main parts:
- **Client**: React application with tRPC client integration
- **Server**: Express server with tRPC router implementation

### Client-Server Communication

The application uses tRPC for type-safe API communication between the client and server. Here's how it works:

1. **Type Sharing**: The server defines the API router with procedures (queries and mutations), and the client imports these types directly from the server code.

2. **API Endpoints**:
   - `getUsers`: Fetches all users
   - `getUserById`: Fetches a specific user by ID
   - `createUser`: Creates a new user
   - `deleteUser`: Deletes a user by ID

3. **Data Flow**:
   ```
   Client (React) <--tRPC--> Server (Express)
   ```

## Setup and Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm run server
   ```

3. Start the client:
   ```bash
   npm run dev
   ```

## Project Structure

```
my-react-demo/
├── src/                    # Client source code
│   ├── App.tsx            # Main React application
│   └── styles.ts          # Styling definitions
├── server/                # Server source code
│   └── index.ts          # Express server with tRPC router
└── package.json          # Project dependencies
```

## Key Features

### Server-Side (Express + tRPC)

1. **Router Definition**:
   ```typescript
   const appRouter = router({
     getUsers: publicProcedure.query(() => users),
     getUserById: publicProcedure
       .input(z.string())
       .query(({ input }) => users.find(u => u.id === input)),
     createUser: publicProcedure
       .input(z.object({ name: z.string(), email: z.string().email() }))
       .mutation(({ input }) => {
         // Create user logic
       }),
     deleteUser: publicProcedure
       .input(z.string())
       .mutation(({ input }) => {
         // Delete user logic
       })
   });
   ```

2. **Error Handling**:
   - Global error handling middleware
   - Type-safe error responses
   - Input validation using Zod

### Client-Side (React + tRPC)

1. **tRPC Client Setup**:
   ```typescript
   const trpc = createTRPCReact<AppRouter>();
   const trpcClient = trpc.createClient({
     links: [httpBatchLink({ url: 'http://localhost:4000/trpc' })],
   });
   ```

2. **Data Fetching**:
   ```typescript
   const usersQuery = trpc.getUsers.useQuery();
   const userByIdQuery = trpc.getUserById.useQuery(id);
   ```

3. **Mutations**:
   ```typescript
   const createUserMutation = trpc.createUser.useMutation({
     onSuccess: () => {
       // Handle success
     },
   });
   ```

## Type Safety

The application leverages TypeScript and tRPC for end-to-end type safety:

1. **Server Types**: All API procedures are typed with input and output schemas
2. **Client Types**: Automatically inferred from server types
3. **Runtime Validation**: Zod schemas ensure data validation

## UI Features

1. **User List**:
   - Display all users
   - Show user details
   - Delete user functionality

2. **Add User Form**:
   - Form validation
   - Success/error feedback
   - Real-time updates

## Error Handling

1. **Server-Side**:
   - Input validation
   - Error middleware
   - Type-safe error responses

2. **Client-Side**:
   - Loading states
   - Error messages
   - Success notifications

## Development

### Available Scripts

- `npm run dev`: Start the client development server
- `npm run server`: Start the Express server
- `npm run build`: Build the client application

### Environment Variables

Create a `.env` file in the root directory:
```
PORT=4000
```

## Best Practices Implemented

1. **Type Safety**:
   - End-to-end type safety with tRPC
   - Zod schema validation
   - TypeScript strict mode

2. **Error Handling**:
   - Global error middleware
   - Type-safe error responses
   - User-friendly error messages

3. **Performance**:
   - React Query for caching
   - Optimistic updates
   - Batch requests

4. **UX**:
   - Loading states
   - Success/error feedback
   - Responsive design

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
