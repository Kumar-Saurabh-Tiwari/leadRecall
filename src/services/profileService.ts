import { environment } from '@/config/environment';
import { ProfileResponse } from '@/types';
import { cacheService } from './cacheService';

/**
 * ProfileService handles all API calls related to user profile
 * Includes caching with IndexedDB for improved performance
 */

class ProfileService {
    private apiUrl = environment.apiUrl;
    private readonly CACHE_STORE = 'profiles';
    private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    /**
     * Fetch profile data of user by email
     * First tries to get from cache, then falls back to API
     * Used in profile page to show the profile info of the user (attendee/exhibitor)
     */
    async getLeadUserProfileByEmail(email: string): Promise<ProfileResponse> {
        const cacheKey = `profile_${email}`;

        try {
            // Try to get from cache first
            const cachedData = await cacheService.get<ProfileResponse>(
                this.CACHE_STORE,
                cacheKey
            );

            if (cachedData) {
                console.log('Profile loaded from cache:', email);
                return cachedData;
            }
        } catch (cacheError) {
            // Cache error should not block the API call
            console.warn('Cache read error:', cacheError);
        }

        try {
            // Fetch from API
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

            const data: ProfileResponse = await response.json();

            // Save to cache for future use
            try {
                await cacheService.set(
                    this.CACHE_STORE,
                    cacheKey,
                    data,
                    this.CACHE_TTL
                );
                console.log('Profile cached successfully:', email);
            } catch (cacheError) {
                // Cache write error should not affect the response
                console.warn('Cache write error:', cacheError);
            }

            return data;
        } catch (error) {
            console.error('Profile fetch error:', error);
            throw error;
        }
    }

    /**
     * Clear cached profile data for a specific email
     */
    async clearProfileCache(email: string): Promise<void> {
        const cacheKey = `profile_${email}`;
        try {
            await cacheService.delete(this.CACHE_STORE, cacheKey);
            console.log('Profile cache cleared for:', email);
        } catch (error) {
            console.warn('Error clearing profile cache:', error);
        }
    }

    /**
     * Clear all cached profiles
     */
    async clearAllProfileCache(): Promise<void> {
        try {
            await cacheService.clear(this.CACHE_STORE);
            console.log('All profile cache cleared');
        } catch (error) {
            console.warn('Error clearing all profile cache:', error);
        }
    }
}

export const profileService = new ProfileService();
