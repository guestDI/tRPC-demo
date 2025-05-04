// server/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define a context - an object available to all procedures
type Context = {
    userId?: string;
};

// Initialize tRPC with a context factory
const createContext = ({ req, res }: { req: Request; res: Response }): Context => {
    return {
        userId: req.headers.authorization || undefined,
    };
};

// Initialize tRPC with error formatting
const t = initTRPC.context<Context>().create({
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError:
                    error.cause instanceof z.ZodError ? error.cause.flatten() : null,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                code: error.code,
                message: error.message,
                // Add custom error codes mapping
                errorCode: mapErrorCode(error.code),
            },
        };
    },
});

// Map tRPC error codes to custom error codes
function mapErrorCode(code: string): string {
    const errorCodeMap: Record<string, string> = {
        BAD_REQUEST: 'INVALID_INPUT',
        UNAUTHORIZED: 'AUTH_REQUIRED',
        FORBIDDEN: 'ACCESS_DENIED',
        NOT_FOUND: 'RESOURCE_NOT_FOUND',
        METHOD_NOT_SUPPORTED: 'INVALID_METHOD',
        TIMEOUT: 'REQUEST_TIMEOUT',
        CONFLICT: 'RESOURCE_CONFLICT',
        PRECONDITION_FAILED: 'PRECONDITION_FAILED',
        PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
        UNPROCESSABLE_CONTENT: 'VALIDATION_FAILED',
        TOO_MANY_REQUESTS: 'RATE_LIMIT_EXCEEDED',
        CLIENT_CLOSED_REQUEST: 'CLIENT_DISCONNECTED',
        INTERNAL_SERVER_ERROR: 'SERVER_ERROR',
    };
    return errorCodeMap[code] || 'UNKNOWN_ERROR';
}

// Create a logging middleware
const loggingMiddleware = t.middleware(async ({ path, type, next }) => {
    const start = Date.now();
    console.log(`[${new Date().toISOString()}] ${type.toUpperCase()} ${path} - Started`);
    
    try {
        const result = await next();
        const durationMs = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${type.toUpperCase()} ${path} - Completed in ${durationMs}ms`);
        return result;
    } catch (error) {
        const durationMs = Date.now() - start;
        console.error(`[${new Date().toISOString()}] ${type.toUpperCase()} ${path} - Failed after ${durationMs}ms`);
        throw error;
    }
});

// Create a procedure with middleware
const publicProcedure = t.procedure.use(loggingMiddleware);

// Create base router and procedure helpers
const router = t.router;

// Define some mock data
const users = [
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' },
    { id: '3', name: 'Charlie', email: 'charlie@example.com' },
];

// Create a tRPC router with procedures
const appRouter = router({
    // Query procedure - get all users
    getUsers: publicProcedure.query(() => {
        return users;
    }),

    // Query procedure with input validation - get user by id
    getUserById: publicProcedure
        .input(z.string().min(1, "User ID is required"))
        .query(({ input }) => {
            const user = users.find(u => u.id === input);
            if (!user) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `User with id ${input} not found`,
                    cause: new Error('User not found in database'),
                });
            }
            return user;
        }),

    // Mutation procedure - create a new user
    createUser: publicProcedure
        .input(z.object({
            name: z.string().min(2, "Name must be at least 2 characters"),
            email: z.string().email("Invalid email format"),
        }))
        .mutation(({ input }) => {
            const existingUser = users.find(u => u.email === input.email);
            if (existingUser) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'User with this email already exists',
                    cause: new Error('Email already registered'),
                });
            }

            const newUser = {
                id: String(users.length + 1),
                name: input.name,
                email: input.email,
            };

            users.push(newUser);
            return newUser;
        }),

    // Mutation procedure - delete a user
    deleteUser: publicProcedure
        .input(z.string().min(1, "User ID is required"))
        .mutation(({ input }) => {
            const userIndex = users.findIndex(u => u.id === input);
            if (userIndex === -1) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `User with id ${input} not found`,
                    cause: new Error('User not found in database'),
                });
            }

            const deletedUser = users[userIndex];
            users.splice(userIndex, 1);
            return deletedUser;
        }),
});

// Export type definition of API
export type AppRouter = typeof appRouter;

// Create Express server
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// Add tRPC middleware
app.use(
    '/trpc',
    createExpressMiddleware({
        router: appRouter,
        createContext,
        onError: ({ error, type, path, req, input, ctx, req: request }) => {
            console.error('tRPC Error:', {
                error,
                type,
                path,
                input,
                userId: ctx?.userId,
                method: request.method,
                url: request.url,
            });
        },
    })
);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/trpc`);
});