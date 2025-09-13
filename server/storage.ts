import {
  users,
  matchRequests,
  matchConnections,
  type User,
  type UpsertUser,
  type MatchRequest,
  type InsertMatchRequest,
  type MatchConnection,
  type InsertMatchConnection,
} from "@shared/schema";
import { randomUUID } from "crypto";

// Gaming-focused storage interface with real-time capabilities
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, profile: Partial<User>): Promise<User>;
  
  // Match request operations
  getMatchRequests(filters?: { game?: string; mode?: string; region?: string }): Promise<MatchRequest[]>;
  createMatchRequest(request: InsertMatchRequest): Promise<MatchRequest>;
  updateMatchRequestStatus(id: string, status: string): Promise<MatchRequest>;
  deleteMatchRequest(id: string): Promise<void>;
  
  // Match connection operations
  createMatchConnection(connection: InsertMatchConnection): Promise<MatchConnection>;
  updateMatchConnectionStatus(id: string, status: string): Promise<MatchConnection>;
  getUserConnections(userId: string): Promise<MatchConnection[]>;
}

// In-memory storage for development
export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private matchRequests: Map<string, MatchRequest> = new Map();
  private matchConnections: Map<string, MatchConnection> = new Map();

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      ...existingUser,
      ...userData,
      id: userData.id || randomUUID(),
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserProfile(id: string, profile: Partial<User>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) throw new Error('User not found');
    
    const updatedUser: User = {
      ...existingUser,
      ...profile,
      id,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Match request operations
  async getMatchRequests(filters?: { game?: string; mode?: string; region?: string }): Promise<MatchRequest[]> {
    let requests = Array.from(this.matchRequests.values());
    
    if (filters?.game) {
      requests = requests.filter(r => r.gameName.toLowerCase().includes(filters.game!.toLowerCase()));
    }
    if (filters?.mode) {
      requests = requests.filter(r => r.gameMode === filters.mode);
    }
    if (filters?.region) {
      requests = requests.filter(r => r.region === filters.region);
    }
    
    return requests.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createMatchRequest(requestData: InsertMatchRequest): Promise<MatchRequest> {
    const request: MatchRequest = {
      ...requestData,
      id: randomUUID(),
      status: 'waiting',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.matchRequests.set(request.id, request);
    return request;
  }

  async updateMatchRequestStatus(id: string, status: string): Promise<MatchRequest> {
    const request = this.matchRequests.get(id);
    if (!request) throw new Error('Match request not found');
    
    const updatedRequest = { ...request, status, updatedAt: new Date() };
    this.matchRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async deleteMatchRequest(id: string): Promise<void> {
    this.matchRequests.delete(id);
  }

  // Match connection operations
  async createMatchConnection(connectionData: InsertMatchConnection): Promise<MatchConnection> {
    const connection: MatchConnection = {
      ...connectionData,
      id: randomUUID(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.matchConnections.set(connection.id, connection);
    return connection;
  }

  async updateMatchConnectionStatus(id: string, status: string): Promise<MatchConnection> {
    const connection = this.matchConnections.get(id);
    if (!connection) throw new Error('Match connection not found');
    
    const updatedConnection = { ...connection, status, updatedAt: new Date() };
    this.matchConnections.set(id, updatedConnection);
    return updatedConnection;
  }

  async getUserConnections(userId: string): Promise<MatchConnection[]> {
    return Array.from(this.matchConnections.values())
      .filter(c => c.requesterId === userId || c.accepterId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }
}

export const storage = new MemStorage();

// Seed some mock data for development
// TODO: Remove mock data when implementing real backend
if (process.env.NODE_ENV === 'development') {
  const seedData = async () => {
    // Create sample users
    const users = [
      {
        id: 'user1',
        email: 'alex@example.com',
        firstName: 'Alex',
        lastName: 'Chen',
        gamertag: 'AlexGamer',
        bio: 'Competitive FPS player looking for ranked teammates',
        location: 'San Francisco, CA',
        age: 24,
        preferredGames: ['Valorant', 'CS2', 'Apex Legends'],
      },
      {
        id: 'user2',
        email: 'sam@example.com',
        firstName: 'Sam',
        lastName: 'Rivera',
        gamertag: 'SamTheSniper',
        bio: 'Casual gamer, loves team-based strategy games',
        location: 'Austin, TX',
        age: 28,
        preferredGames: ['League of Legends', 'Overwatch 2', 'Rocket League'],
      },
      {
        id: 'user3',
        email: 'jordan@example.com',
        firstName: 'Jordan',
        lastName: 'Park',
        gamertag: 'JordanPro',
        bio: 'MOBA enthusiast and tournament organizer',
        location: 'Seattle, WA',
        age: 22,
        preferredGames: ['Dota 2', 'League of Legends', 'Heroes of the Storm'],
      },
    ];

    for (const userData of users) {
      await storage.upsertUser(userData);
    }

    // Create sample match requests
    const matchRequests = [
      {
        userId: 'user1',
        gameName: 'Valorant',
        gameMode: '5v5',
        description: 'Looking for Diamond+ players for ranked queue. Need good comms!',
        region: 'NA West',
      },
      {
        userId: 'user2',
        gameName: 'Rocket League',
        gameMode: '3v3',
        description: 'Casual 3v3 matches, just for fun. All skill levels welcome!',
        region: 'NA Central',
      },
      {
        userId: 'user3',
        gameName: 'League of Legends',
        gameMode: '5v5',
        tournamentName: 'Spring Tournament',
        description: 'Forming team for upcoming tournament. Looking for experienced support and jungle.',
        region: 'NA West',
      },
      {
        userId: 'user1',
        gameName: 'CS2',
        gameMode: '5v5',
        description: 'Faceit Level 8+ only. Serious players for competitive matches.',
        region: 'NA West',
      },
      {
        userId: 'user2',
        gameName: 'Apex Legends',
        gameMode: '3v3',
        description: 'Ranked Arenas, looking for consistent teammates. Currently Platinum.',
        region: 'NA Central',
      },
    ];

    for (const requestData of matchRequests) {
      await storage.createMatchRequest(requestData);
    }
  };

  seedData().catch(console.error);
}