// Declaraciones de tipos globales para UTalk Frontend
// Resuelve errores de tipos del DOM y APIs del navegador

declare global {
    // Tipos de NodeJS para timeouts
    namespace NodeJS {
        interface Timer {
            ref(): Timer;
            unref(): Timer;
        }
    }
}

export { };

