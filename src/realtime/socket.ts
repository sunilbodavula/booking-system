import { Server as HttpServer } from "http";
import {Server as SocketIOServer, Socket} from 'socket.io';
import { AuthUser } from '../types'
import { verifyAccessToken } from "../utils/token";
import { SocketAddress } from "net";

let io: SocketIOServer | null = null;

export function initSocket(httpServer: HttpServer): SocketIOServer {
    io = new SocketIOServer(httpServer, {
        cors: { origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173'},
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token as string | undefined;
        if(!token){
            next(new Error('Authentication required'));
            return;
        }
        try{
            const user = verifyAccessToken(token);
            (socket as Socket & {user: AuthUser}).user = user;
            next();
        }catch{
            next(new Error('Invalid or expired token'));
        }
    });

    io.on('connection', (socket) => {
        socket.on('watch:resource', (resourceId: number) => {
            if(!Number.isInteger(resourceId) || resourceId <= 0) return;
            socket.join(`resource:${resourceId}`);
        });

        socket.on('unwatch:resource', (resourceId: number) => {
            socket.leave(`resource:${resourceId}`);
        });
    });

    return io;
}

export function emitBookingCreated(resourceId: number, booking: unknown): void {
    io?.to(`resource:${resourceId}`).emit('booking:created', booking);
}

export function emitBookingCancelled(resourceId: number, bookingId: number): void {
    io?.to(`resource:${resourceId}`).emit('booking:cancelled', {id: bookingId});
}