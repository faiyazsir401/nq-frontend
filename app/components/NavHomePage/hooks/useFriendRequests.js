import { useState, useEffect, useCallback } from 'react';
import {
  acceptFriendRequest,
  getFriendRequests,
  rejectFriendRequest,
} from '../../../common/common.api';
import { toast } from 'react-toastify';

/**
 * Custom hook for managing friend requests
 * Extracted from NavHomePage/index.jsx to improve maintainability
 */
export const useFriendRequests = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch friend requests
   */
  const fetchFriendRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getFriendRequests();
      setFriendRequests(res?.friendRequests || []);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      toast.error('Failed to fetch friend requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Accept a friend request
   */
  const handleAcceptFriendRequest = useCallback(
    async (requestId) => {
      try {
        await acceptFriendRequest({ requestId });
        toast.success('Friend request accepted');
        fetchFriendRequests();
      } catch (error) {
        console.error('Error accepting friend request:', error);
        toast.error('Failed to accept friend request');
      }
    },
    [fetchFriendRequests]
  );

  /**
   * Reject a friend request
   */
  const handleRejectFriendRequest = useCallback(
    async (requestId) => {
      try {
        await rejectFriendRequest({ requestId });
        toast.success('Friend request rejected');
        fetchFriendRequests();
      } catch (error) {
        console.error('Error rejecting friend request:', error);
        toast.error('Failed to reject friend request');
      }
    },
    [fetchFriendRequests]
  );

  useEffect(() => {
    fetchFriendRequests();
  }, [fetchFriendRequests]);

  return {
    friendRequests,
    isLoading,
    fetchFriendRequests,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
  };
};

