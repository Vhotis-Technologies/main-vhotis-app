
export default interface AuthContextInterface {
  onLogin: () => void;
  onGoogleLogin: () => Promise<void>;
  onGuestLogin: () => void;
  isCreatingGuestUser: boolean;
  handleLogout: ( from_main_page? : boolean ) => void;
  rememberMe: boolean;
  setRememberMe: (rememberMe: boolean) => void;
}
