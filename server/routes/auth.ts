import { Request, Response } from "express";
import type {
  // User, // TODO: Usar cuando se implemente funcionalidad de User
  LoginRequest,
  LoginResponse,
  AuthMeResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from "../../shared/api";

// Simulated user database - In production, this should be a real database
const users = [
  {
    id: "1",
    email: "admin@utalk.com",
    password: "admin123", // In production, this should be hashed
    name: "Administrador",
    role: "admin",
    active: true,
  },
  {
    id: "2",
    email: "demo@utalk.com",
    password: "demo123",
    name: "Usuario Demo",
    role: "user",
    active: true,
  },
];

// JWT secret - In production, this should be in environment variables
// const JWT_SECRET = "your-secret-key"; // TODO: Usar cuando se implemente JWT

// Simple JWT token creation (in production, use a proper JWT library)
function createToken(user: any) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  };

  // Simple base64 encoding (in production, use proper JWT signing)
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

// Simple JWT token verification
function verifyToken(token: string) {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString());

    // Check if token is expired
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function handleLogin(
  req: Request<{}, LoginResponse, LoginRequest>,
  res: Response<LoginResponse>,
) {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      message: "Email y contraseña son requeridos",
    });
  }

  // Find user
  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({
      message: "Credenciales inválidas",
    });
  }

  // Check password
  if (user.password !== password) {
    return res.status(401).json({
      message: "Credenciales inválidas",
    });
  }

  // Check if user is active
  if (!user.active) {
    return res.status(401).json({
      message: "Usuario inactivo. Contacta al administrador",
    });
  }

  // Create token
  const token = createToken(user);

  // Return success response
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    expiresIn: "24h",
  });
}

export function handleMe(
  req: Request<{}, AuthMeResponse>,
  res: Response<AuthMeResponse>,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token de autorización requerido",
    });
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({
      message: "Token inválido o expirado",
    });
  }

  // Find user
  const user = users.find((u) => u.id === payload.id);
  if (!user || !user.active) {
    return res.status(401).json({
      message: "Usuario no encontrado o inactivo",
    });
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}

export function handleForgotPassword(
  req: Request<{}, ForgotPasswordResponse, ForgotPasswordRequest>,
  res: Response<ForgotPasswordResponse>,
) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email es requerido",
    });
  }

  // Find user
  const user = users.find((u) => u.email === email);
  if (!user) {
    // For security, we return success even if user doesn't exist
    return res.json({
      message: "Si el email existe, recibirás instrucciones de recuperación",
    });
  }

  // In production, send actual email with reset link
  console.log(`Password reset requested for: ${email}`);

  res.json({
    message: "Si el email existe, recibirás instrucciones de recuperación",
  });
}
