import { AppConfig, UserSession, showConnect } from '@stacks/connect';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export function authenticate() {
  showConnect({
    appDetails: {
      name: 'ClarityXO',
      icon: window.location.origin + '/vite.svg',
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
}

export function getUserData() {
  try {
    return userSession.loadUserData();
  } catch (error) {
    console.error('Error loading user data:', error);
    // Clear corrupted session data
    userSession.signUserOut();
    return null;
  }
}

export function isUserSignedIn() {
  try {
    return userSession.isUserSignedIn();
  } catch (error) {
    console.error('Error checking sign in status:', error);
    // Clear corrupted session data
    userSession.signUserOut();
    return false;
  }
}

export function disconnect() {
  userSession.signUserOut('/');
}
