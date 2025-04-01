export interface Room {
    roomId: string;
    hostId: string;
    clients: Set<string>;
    createdAt: number;
}

export type RoomRole = 'host' | 'client';

export interface RoomMessage {
    type: 'CREATE_ROOM' | 'JOIN_ROOM' | 'LEAVE_ROOM';
    payload: {
        roomId?: string;
        clientId: string;
        role: RoomRole;
    };
}