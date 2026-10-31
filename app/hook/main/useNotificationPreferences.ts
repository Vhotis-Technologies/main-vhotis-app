import { useCallback, useEffect, useMemo, useState } from "react";
import {
  NotificationPreferences,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from "@/app/store/main/api/notificationApi";
import { NotificationSettings } from "@/app/interfaces/main/settings/SettingsInterface";

function toLocalSettings(prefs: NotificationPreferences): NotificationSettings {
  return {
    pushNotifications: prefs.allow_push_notification,
    emailNotifications: prefs.allow_email_notification,
    marketingEmails: prefs.allow_marketing_emails,
  };
}

function toServerPayload(settings: NotificationSettings) {
  return {
    allow_push_notification: settings.pushNotifications,
    allow_email_notification: settings.emailNotifications,
    allow_marketing_emails: settings.marketingEmails,
  };
}

function settingsEqual(a: NotificationSettings, b: NotificationSettings) {
  return (
    a.pushNotifications === b.pushNotifications &&
    a.emailNotifications === b.emailNotifications &&
    a.marketingEmails === b.marketingEmails
  );
}

export function useNotificationPreferences() {
  const { data, isLoading, isFetching, refetch, error } =
    useGetNotificationPreferencesQuery();
  const [updatePreferences, { isLoading: isSaving }] =
    useUpdateNotificationPreferencesMutation();

  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    marketingEmails: true,
  });
  const [savedSettings, setSavedSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    marketingEmails: true,
  });

  useEffect(() => {
    if (!data) return;
    const next = toLocalSettings(data);
    setSettings(next);
    setSavedSettings(next);
  }, [data]);

  const hasChanges = useMemo(
    () => !settingsEqual(settings, savedSettings),
    [settings, savedSettings],
  );

  const toggleSetting = useCallback(
    (key: keyof NotificationSettings, value: boolean) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const saveSettings = useCallback(async () => {
    const result = await updatePreferences(toServerPayload(settings)).unwrap();
    const next = toLocalSettings(result.preferences);
    setSettings(next);
    setSavedSettings(next);
    return result;
  }, [settings, updatePreferences]);

  const resetToSaved = useCallback(() => {
    setSettings(savedSettings);
  }, [savedSettings]);

  return {
    settings,
    savedSettings,
    hasChanges,
    isLoading: isLoading || isFetching,
    isSaving,
    error,
    toggleSetting,
    saveSettings,
    resetToSaved,
    refetch,
  };
}
