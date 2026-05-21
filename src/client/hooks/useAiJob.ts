import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AI } from '../api/http';

export function useAiJob(jobId: string | null) {
  return useQuery({
    queryKey: ['ai-job', jobId],
    queryFn: () => AI.getJob(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'success' || status === 'failed') return false;
      return 3000;
    },
  });
}

export function useAiJobs() {
  return useQuery({
    queryKey: ['ai-jobs'],
    queryFn: () => AI.listJobs(),
  });
}

export function useGenerateImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: AI.generateImage,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ai-jobs'] }),
  });
}

export function useGenerateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: AI.generateVideo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ai-jobs'] }),
  });
}

export function useGenerateMusic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: AI.generateMusic,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ai-jobs'] }),
  });
}

export function useAiChat() {
  return useMutation({ mutationFn: AI.chat });
}
