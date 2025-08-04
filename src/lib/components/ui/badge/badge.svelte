<script lang="ts">
  import type { BadgeVariant } from '$lib/types/ui';
  import { cn } from '$lib/utils';

  // Props del componente
  export let variant: BadgeVariant = 'default';
  export let className = '';

  // Función para crear clases CSS
  function getBadgeClasses(variant: BadgeVariant): string {
    const baseClasses =
      'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantClasses = {
      default: 'border-transparent bg-primary-600 text-white hover:bg-primary-700',
      secondary: 'border-transparent bg-secondary-200 text-secondary-900 hover:bg-secondary-300',
      destructive: 'border-transparent bg-red-600 text-white hover:bg-red-700',
      outline: 'border-secondary-200 text-secondary-900 hover:bg-secondary-50'
    };

    return cn(baseClasses, variantClasses[variant], className);
  }

  $: badgeClasses = getBadgeClasses(variant);
</script>

<div class={badgeClasses} {...$$restProps}>
  <slot />
</div>
