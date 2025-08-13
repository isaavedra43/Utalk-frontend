<!-- Transitions.svelte -->
<!-- Componente con animaciones de transición reutilizables -->

<script lang="ts">
  export let show: boolean = true;
  export let type: 'fade' | 'slide' | 'scale' = 'fade';
  export let duration: number = 300;
</script>

{#if show}
  <div class="transition-container {type}-transition" style="animation-duration: {duration}ms;">
    <slot />
  </div>
{/if}

<style>
  .transition-container {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Transiciones personalizadas */
  .fade-transition {
    animation: fadeIn 0.3s ease-out;
  }

  .slide-transition {
    animation: slideInUp 0.3s ease-out;
  }

  .scale-transition {
    animation: scaleIn 0.3s ease-out;
  }

  /* Clases globales para transiciones */
  :global(.transition-smooth) {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  :global(.transition-fast) {
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  :global(.transition-slow) {
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Animaciones personalizadas */
  :global(.slide-in-right) {
    animation: slideInRight 0.3s ease-out;
  }

  :global(.slide-in-left) {
    animation: slideInLeft 0.3s ease-out;
  }

  :global(.slide-in-up) {
    animation: slideInUp 0.3s ease-out;
  }

  :global(.slide-in-down) {
    animation: slideInDown 0.3s ease-out;
  }

  :global(.fade-in) {
    animation: fadeIn 0.3s ease-out;
  }

  :global(.scale-in) {
    animation: scaleIn 0.3s ease-out;
  }

  :global(.bounce-in) {
    animation: bounceIn 0.6s ease-out;
  }

  /* Keyframes para animaciones */
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideInLeft {
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideInUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideInDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes bounceIn {
    0% {
      transform: scale(0.3);
      opacity: 0;
    }
    50% {
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
</style>
