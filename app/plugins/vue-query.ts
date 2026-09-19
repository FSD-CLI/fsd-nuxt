import type { DehydratedState, VueQueryPluginOptions } from "@tanstack/vue-query";
import { QueryClient, VueQueryPlugin, dehydrate, hydrate } from "@tanstack/vue-query";

export default defineNuxtPlugin((nuxtApp) => {
  const vueQueryState = useState<DehydratedState | null>("vue-query", () => null);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 5_000 },
    },
  });
  const options: VueQueryPluginOptions = { queryClient };

  nuxtApp.vueApp.use(VueQueryPlugin, options);

  if (import.meta.server) {
    nuxtApp.hooks.hook("app:rendered", () => {
      vueQueryState.value = dehydrate(queryClient);
    });
  }

  if (import.meta.client && vueQueryState.value) {
    const dehydratedState = vueQueryState.value;
    nuxtApp.hooks.hook("app:created", () => {
      hydrate(queryClient, dehydratedState);
    });
  }
});
