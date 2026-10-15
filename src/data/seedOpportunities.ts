import { UserProfile } from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  userId: 'guest_user',
  fullName: '',
  email: '',
  gpa: 0,
  major: '',
  educationLevel: 'Undergraduate',
  financialNeed: 'Moderate',
  isFirstGen: false,
  citizenship: '',
  targetCountry: '',
  isConfigured: false,
};
