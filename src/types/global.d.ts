/// <reference types="react" />
/// <reference types="react-dom" />

declare module 'react' {
  import * as React from 'react';
  export = React;
  export as namespace React;
  export const useState: typeof React.useState;
  export const useEffect: typeof React.useEffect;
  export const useCallback: typeof React.useCallback;
  export const useMemo: typeof React.useMemo;
  export const useRef: typeof React.useRef;
  export const useContext: typeof React.useContext;
  export const useReducer: typeof React.useReducer;
  export const createContext: typeof React.createContext;
  export const createElement: typeof React.createElement;
  export const Fragment: typeof React.Fragment;
  export const Component: typeof React.Component;
  export const PureComponent: typeof React.PureComponent;
  export const memo: typeof React.memo;
  export const forwardRef: typeof React.forwardRef;
  export const lazy: typeof React.lazy;
  export const Suspense: typeof React.Suspense;
  export const StrictMode: typeof React.StrictMode;
  export default React;
}

declare module 'react-dom' {
  import * as ReactDOM from 'react-dom';
  export = ReactDOM;
  export as namespace ReactDOM;
  export const render: typeof ReactDOM.render;
  export const createRoot: typeof ReactDOM.createRoot;
  export const hydrate: typeof ReactDOM.hydrate;
  export const unmountComponentAtNode: typeof ReactDOM.unmountComponentAtNode;
  export const findDOMNode: typeof ReactDOM.findDOMNode;
  export const createPortal: typeof ReactDOM.createPortal;
}

declare module 'lucide-react' {
  export const ArrowLeft: any;
  export const Download: any;
  export const Share2: any;
  export const Edit: any;
  export const MoreHorizontal: any;
  export const User: any;
  export const Building: any;
  export const MapPin: any;
  export const Calendar: any;
  export const DollarSign: any;
  export const FileText: any;
  export const AlertTriangle: any;
  export const Star: any;
  export const Award: any;
  export const History: any;
  export const Plus: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
