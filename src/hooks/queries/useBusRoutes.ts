import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import type { BusRoute, BusRoutePayload } from '~/types';
import {
  ApiUrl,
  appRequest,
  HttpMethodType,
  queryEnum,
  toastApiError,
} from '~/utils';

export const busRoutesQueryOptions = queryOptions({
  queryKey: [queryEnum.ROUTE.LIST],
  queryFn: async () => {
    const resp = await appRequest<BusRoute[]>({ url: ApiUrl.ROUTE.BASE });
    return resp.data;
  },
});

export const busRouteQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [queryEnum.ROUTE.DETAIL, id],
    queryFn: async () => {
      const resp = await appRequest<BusRoute>({
        url: ApiUrl.ROUTE.DETAIL(id),
      });
      return resp.data;
    },
  });

export const useBusRoutes = () => useQuery(busRoutesQueryOptions);

/** For routes whose loader has already fetched the bus route */
export const useBusRoute = (id: string) =>
  useSuspenseQuery(busRouteQueryOptions(id));

export const useUpdateBusRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BusRoutePayload }) => {
      const resp = await appRequest<BusRoute>({
        url: ApiUrl.ROUTE.DETAIL(id),
        method: HttpMethodType.PUT,
        data,
      });
      return resp.data;
    },
    onSuccess: (route) => {
      queryClient.setQueryData([queryEnum.ROUTE.DETAIL, route.id], route);
      queryClient.invalidateQueries({ queryKey: [queryEnum.ROUTE.LIST] });
      toast.success(`${route.name} saved`);
    },
    onError: (error) => toastApiError(error, 'Couldn’t save the route.'),
  });
};

export const useResetBusRoutes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const resp = await appRequest<BusRoute[]>({
        url: ApiUrl.ROUTE.RESET,
        method: HttpMethodType.POST,
      });
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryEnum.ROUTE.LIST] });
      queryClient.invalidateQueries({ queryKey: [queryEnum.ROUTE.DETAIL] });
      toast.success('Sample routes restored');
    },
    onError: (error) => toastApiError(error, 'Couldn’t restore the routes.'),
  });
};
