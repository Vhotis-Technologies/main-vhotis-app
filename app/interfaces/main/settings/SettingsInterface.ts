export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  marketingEmails: boolean;
}

export interface ThemeSettings {
  lightMode: boolean;
  darkMode: boolean;
  useSystemTheme: boolean;
}

export interface UserSettings {
  notifications: NotificationSettings;
  theme: ThemeSettings;
}
