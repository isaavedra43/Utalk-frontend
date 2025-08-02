type DynamicRoutes = {
	
};

type Layouts = {
	"/": undefined;
	"/chat": undefined;
	"/conversations": undefined;
	"/login": undefined;
	"/profile": undefined
};

export type RouteId = "/" | "/chat" | "/conversations" | "/login" | "/profile";

export type RouteParams<T extends RouteId> = T extends keyof DynamicRoutes ? DynamicRoutes[T] : Record<string, never>;

export type LayoutParams<T extends RouteId> = Layouts[T] | Record<string, never>;

export type Pathname = "/" | "/chat" | "/conversations" | "/login" | "/profile";

export type ResolvedPathname = `${"" | `/${string}`}${Pathname}`;

export type Asset = "/robots.txt";