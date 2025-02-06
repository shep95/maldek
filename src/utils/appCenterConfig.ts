
import AppCenter from 'appcenter';
import Analytics from 'appcenter-analytics';
import Crashes from 'appcenter-crashes';

export const initializeAppCenter = async () => {
  try {
    await AppCenter.start();
    await Analytics.setEnabled(true);
    await Crashes.setEnabled(true);
    console.log('App Center initialized successfully');
  } catch (error) {
    console.error('Failed to initialize App Center:', error);
  }
};

export const checkForUpdate = async () => {
  try {
    const update = await AppCenter.checkForUpdate();
    if (update) {
      console.log('Update available:', update);
      return update;
    }
    return null;
  } catch (error) {
    console.error('Failed to check for update:', error);
    return null;
  }
};
