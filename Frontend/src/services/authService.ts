export type LoginSuccess = {
    token: string;
    user: { id: string, name: string, email:string};
};

export async function login(email: string, password: string): Promise<LoginSuccess> {
  // simulate network
  await new Promise((r) => setTimeout(r, 500));

  // demo creds: test@ex.com / secret123
  if (email === "test@gmail.com" && password === "123456") {
    return { token: "mock-token", user: { id: "1", name: "Test User", email } };
  }
  throw new Error("Invalid email or password");
}