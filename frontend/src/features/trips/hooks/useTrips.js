import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tripsApi } from '../api/tripsApi';

export function useTripsList(params) {
  return useQuery({
    queryKey: ['trips', params],
    queryFn: () => tripsApi.list(params),
    keepPreviousData: true,
  });
}

export function useTrip(id) {
  return useQuery({
    queryKey: ['trips', 'detail', id],
    queryFn: () => tripsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tripsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => tripsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  });
}

export function useAssignTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, driverId }) => tripsApi.assign(id, driverId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  });
}

export function useUpdateTripStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => tripsApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tripsApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  });
}
