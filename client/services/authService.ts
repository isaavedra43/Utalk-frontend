import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@lib/firebaseClient"

export async function login(email: string, password: string): Promise<string> {
  const userCred = await signInWithEmailAndPassword(auth, email, password)
  return userCred.user.getIdToken()
} 