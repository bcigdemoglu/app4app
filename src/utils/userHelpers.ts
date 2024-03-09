import { AuthError, User } from '@supabase/supabase-js';

interface UserResponse {
  data: { user: User | null };
  error: AuthError | null;
}

export function isLoggedIn(user: UserResponse) {
  if (user.data?.user) {
    return true;
  } else {
    return false;
  }
}
