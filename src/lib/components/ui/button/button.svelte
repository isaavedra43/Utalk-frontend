<script lang="ts">
  import type { ButtonSize, ButtonVariant } from '$lib/types/ui';
  import { cn } from '$lib/utils';

  // Props del componente
  export let variant: ButtonVariant = 'default';
  export let size: ButtonSize = 'default';
  export let href: string | undefined = undefined;
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled = false;
  export let className = '';

  // Referencia al elemento
  let buttonElement: unknown;

  // Función para crear clases CSS
  function getButtonClasses(variant: ButtonVariant, size: ButtonSize): string {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variantClasses = {
      default: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
      outline:
        'border border-secondary-200 bg-white text-secondary-900 hover:bg-secondary-50 focus-visible:ring-secondary-500',
      secondary:
        'bg-secondary-200 text-secondary-900 hover:bg-secondary-300 focus-visible:ring-secondary-500',
      ghost: 'text-secondary-900 hover:bg-secondary-100 focus-visible:ring-secondary-500',
      link: 'text-primary-600 underline-offset-4 hover:underline focus-visible:ring-primary-500'
    };

    const sizeClasses = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 px-3',
      lg: 'h-11 px-8',
      icon: 'h-10 w-10'
    };

    return cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
  }

  $: buttonClasses = getButtonClasses(variant, size);
</script>

{#if href}
  <a
    bind:this={buttonElement}
    class={buttonClasses}
    href={disabled ? undefined : href}
    aria-disabled={disabled}
    role={disabled ? 'link' : undefined}
    tabindex={disabled ? -1 : undefined}
  >
    <slot />
  </a>
{:else}
  <button bind:this={buttonElement} class={buttonClasses} {type} {disabled}>
    <slot />
  </button>
{/if}
