import { getServerSession } from "next-auth";
import { authOptions } from "./options";

export async function getServerAuthSession() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    const customUser = session.user as {
      id?: string;
      user_id?: string;
      name?: string | null;
      image?: string | null;
      email?: string | null;
      provider?: string;
    };

    return {
      ...session,
      user: {
        ...session.user,
        user_id: customUser.id || customUser.user_id,
        display_name: customUser.name,
        avatar: customUser.image,
        auth_type: customUser.provider || "registered",
        is_verified: true,
      },
    };
  }
  return null;
}
