import { environment } from '@/config/environment';
import { ProfileResponse } from '@/types';

/**
 * ProfileService handles all API calls related to user profile
 */

class ProfileService {
    private apiUrl = environment.apiUrl;

    /**
     * Fetch profile data of user by email
     * Used in profile page to show the profile info of the user (attendee/exhibitor)
     */
    async getLeadUserProfileByEmail(email: string): Promise<ProfileResponse> {
        try {
            const response = await fetch(`${this.apiUrl}/users/register-leaduser/${email}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Anonymous': 'true'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch profile: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Profile fetch error:', error);
            throw error;
        }
    }
}

export const profileService = new ProfileService();
