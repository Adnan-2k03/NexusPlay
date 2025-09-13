import {
  users,
  matchRequests,
  matchConnections,
  type User,
  type UpsertUser,
  type MatchRequest,
  type MatchRequestWithUser,
  type InsertMatchRequest,
  type MatchConnection,
  type InsertMatchConnection,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

// Gaming-focused storage interface with real-time capabilities
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, profile: Partial<User>): Promise<User>;
  
  // Match request operations
  getMatchRequests(filters?: { game?: string; mode?: string; region?: string }): Promise<MatchRequestWithUser[]>;
  createMatchRequest(request: InsertMatchRequest): Promise<MatchRequest>;
  updateMatchRequestStatus(id: string, status: string): Promise<MatchRequest>;
  deleteMatchRequest(id: string): Promise<void>;
  
  // Match connection operations
  createMatchConnection(connection: InsertMatchConnection): Promise<MatchConnection>;
  updateMatchConnectionStatus(id: string, status: string): Promise<MatchConnection>;
  getUserConnections(userId: string): Promise<MatchConnection[]>;
}

// Database storage implementation using PostgreSQL
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, profile: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error('User not found');
    }
    
    return updatedUser;
  }

  // Match request operations
  async getMatchRequests(filters?: { game?: string; mode?: string; region?: string }): Promise<MatchRequestWithUser[]> {
    const conditions = [];
    
    if (filters?.game) {
      conditions.push(ilike(matchRequests.gameName, `%${filters.game}%`));
    }
    if (filters?.mode) {
      conditions.push(eq(matchRequests.gameMode, filters.mode));
    }
    if (filters?.region) {
      conditions.push(eq(matchRequests.region, filters.region));
    }
    
    // Join with users table to get gamertag and profile data
    const query = db
      .select({
        id: matchRequests.id,
        userId: matchRequests.userId,
        gameName: matchRequests.gameName,
        gameMode: matchRequests.gameMode,
        tournamentName: matchRequests.tournamentName,
        description: matchRequests.description,
        status: matchRequests.status,
        region: matchRequests.region,
        createdAt: matchRequests.createdAt,
        updatedAt: matchRequests.updatedAt,
        gamertag: users.gamertag,
        profileImageUrl: users.profileImageUrl,
      })
      .from(matchRequests)
      .leftJoin(users, eq(matchRequests.userId, users.id));
    
    if (conditions.length > 0) {
      const requests = await query
        .where(and(...conditions))
        .orderBy(desc(matchRequests.createdAt));
      return requests;
    } else {
      const requests = await query
        .orderBy(desc(matchRequests.createdAt));
      return requests;
    }
  }

  async createMatchRequest(requestData: InsertMatchRequest): Promise<MatchRequest> {
    const [request] = await db
      .insert(matchRequests)
      .values(requestData)
      .returning();
    return request;
  }

  async updateMatchRequestStatus(id: string, status: string): Promise<MatchRequest> {
    const [updatedRequest] = await db
      .update(matchRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(matchRequests.id, id))
      .returning();
    
    if (!updatedRequest) {
      throw new Error('Match request not found');
    }
    
    return updatedRequest;
  }

  async deleteMatchRequest(id: string): Promise<void> {
    await db.delete(matchRequests).where(eq(matchRequests.id, id));
  }

  // Match connection operations
  async createMatchConnection(connectionData: InsertMatchConnection): Promise<MatchConnection> {
    const [connection] = await db
      .insert(matchConnections)
      .values(connectionData)
      .returning();
    return connection;
  }

  async updateMatchConnectionStatus(id: string, status: string): Promise<MatchConnection> {
    const [updatedConnection] = await db
      .update(matchConnections)
      .set({ status, updatedAt: new Date() })
      .where(eq(matchConnections.id, id))
      .returning();
    
    if (!updatedConnection) {
      throw new Error('Match connection not found');
    }
    
    return updatedConnection;
  }

  async getUserConnections(userId: string): Promise<MatchConnection[]> {
    const connections = await db
      .select()
      .from(matchConnections)
      .where(or(
        eq(matchConnections.requesterId, userId),
        eq(matchConnections.accepterId, userId)
      ))
      .orderBy(desc(matchConnections.createdAt));
    
    return connections;
  }
}

export const storage = new DatabaseStorage();

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