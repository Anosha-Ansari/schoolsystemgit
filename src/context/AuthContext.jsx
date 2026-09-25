import { createContext, useContext, useEffect, useState } from "react";
import { hashPassword } from "../utils/hash";
import { roleLabel } from "../data/roles";

const AuthContext = createContext(null);
const USERS_KEY = "ssms_users";
const SESSION_KEY = "ssms_session";

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function toPublicUser(u) {
  return { name: u.name, email: u.email, role: u.role, roleLabel: roleLabel(u.role) };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      let users = loadUsers();
      if (users.length === 0) {
        const passwordHash = await hashPassword("admin123");
        users = [{ id: "USR1", name: "Admin", email: "admin@smartschool.pk", passwordHash, role: "super_admin" }];
        saveUsers(users);
      }
      const sessionEmail = localStorage.getItem(SESSION_KEY);
      if (sessionEmail) {
        const found = users.find((u) => u.email === sessionEmail);
        if (found) setUser(toPublicUser(found));
      }
      setReady(true);
    })();
  }, []);

  const login = async (email, password) => {
    const users = loadUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) return { ok: false, error: "No account found with this email." };
    const hash = await hashPassword(password);
    if (hash !== found.passwordHash) return { ok: false, error: "Incorrect password." };
    localStorage.setItem(SESSION_KEY, found.email);
    setUser(toPublicUser(found));
    return { ok: true };
  };

  const signup = async ({ name, email, password, role }) => {
    const users = loadUsers();
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const passwordHash = await hashPassword(password);
    const newUser = { id: `USR${users.length + 1}`, name: name.trim(), email: email.trim(), passwordHash, role };
    saveUsers([...users, newUser]);
    localStorage.setItem(SESSION_KEY, newUser.email);
    setUser(toPublicUser(newUser));
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!user) return { ok: false, error: "Not logged in." };
    const users = loadUsers();
    const idx = users.findIndex((u) => u.email === user.email);
    if (idx === -1) return { ok: false, error: "Account not found." };
    const currentHash = await hashPassword(currentPassword);
    if (currentHash !== users[idx].passwordHash) return { ok: false, error: "Current password is incorrect." };
    users[idx].passwordHash = await hashPassword(newPassword);
    saveUsers(users);
    return { ok: true };
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, signup, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
