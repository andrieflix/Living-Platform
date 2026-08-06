import { getAuth } from "@/app/lib/auth";

export const { GET, POST } = {
  GET: async (req: Request) => {
    const auth = getAuth();
    return auth.handler(req);
  },
  POST: async (req: Request) => {
    const auth = getAuth();
    return auth.handler(req);
  },
};
