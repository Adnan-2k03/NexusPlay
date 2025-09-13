import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertMatchRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Match request routes
  app.get('/api/match-requests', async (req, res) => {
    try {
      const { game, mode, region } = req.query as Record<string, string>;
      const filters = { game, mode, region };
      const matchRequests = await storage.getMatchRequests(filters);
      res.json(matchRequests);
    } catch (error) {
      console.error("Error fetching match requests:", error);
      res.status(500).json({ message: "Failed to fetch match requests" });
    }
  });

  app.post('/api/match-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertMatchRequestSchema.parse(req.body);
      
      const matchRequest = await storage.createMatchRequest({
        ...validatedData,
        userId,
      });
      
      res.status(201).json(matchRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        console.error("Error creating match request:", error);
        res.status(500).json({ message: "Failed to create match request" });
      }
    }
  });

  app.patch('/api/match-requests/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['waiting', 'connected', 'declined'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedRequest = await storage.updateMatchRequestStatus(id, status);
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating match request:", error);
      res.status(500).json({ message: "Failed to update match request" });
    }
  });

  app.delete('/api/match-requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMatchRequest(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting match request:", error);
      res.status(500).json({ message: "Failed to delete match request" });
    }
  });

  // Match connection routes
  app.post('/api/match-connections', isAuthenticated, async (req: any, res) => {
    try {
      const requesterId = req.user.claims.sub;
      const { requestId, accepterId } = req.body;
      
      const connection = await storage.createMatchConnection({
        requestId,
        requesterId,
        accepterId,
      });
      
      res.status(201).json(connection);
    } catch (error) {
      console.error("Error creating match connection:", error);
      res.status(500).json({ message: "Failed to create match connection" });
    }
  });

  app.patch('/api/match-connections/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['pending', 'accepted', 'declined'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedConnection = await storage.updateMatchConnectionStatus(id, status);
      res.json(updatedConnection);
    } catch (error) {
      console.error("Error updating match connection:", error);
      res.status(500).json({ message: "Failed to update match connection" });
    }
  });

  app.get('/api/user/connections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const connections = await storage.getUserConnections(userId);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching user connections:", error);
      res.status(500).json({ message: "Failed to fetch user connections" });
    }
  });

  // User profile routes
  app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = req.body;
      
      const updatedUser = await storage.updateUserProfile(userId, profileData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
