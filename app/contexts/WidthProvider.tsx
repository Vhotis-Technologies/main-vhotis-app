/**
 * Context and provider for managing responsive width measurements across the application.
 * Provides window width, screen width, and calculated sidebar width values to child components.
 */
import { createContext, useContext, useEffect, useState } from "react";
import { Dimensions } from "react-native";

/**
 * Interface defining the shape of the width context values
 */
interface WidthContextType {
  /** Current window width */
  windowWidth: number;
  screenWidth: number;
  sidebarWidth: number;
}

/**
 * Context for storing and accessing width-related values
 */
const WidthContext = createContext<WidthContextType>({
  windowWidth: 0,
  screenWidth: 0,
  sidebarWidth: 0,
});

/**
 * Provider component that manages width-related values and recalculates them
 * when screen dimensions change.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that will have access to the width context
 * @returns {JSX.Element} The provider component
 */
const WidthProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize state with current window width
  const [windowWidth, setWindowWidth] = useState(
    () => Dimensions.get("window").width
  );
  // Initialize state with current screen width
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("screen").width
  );
  /**
   * Effect to handle screen dimension changes
   * Updates width values when the screen size changes
   */
  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      "change",
      ({ window, screen }) => {
        setWindowWidth(window.width);
        setScreenWidth(screen.width);
      }
    );

    // Cleanup subscription on unmount
    return () => subscription.remove();
  }, []);

  // Calculate sidebar width based on screen dimensions
  const sidebarWidth =
    windowWidth < screenWidth * 0.5 ? screenWidth * 0.2 : screenWidth * 0.25;

  // Context value object
  const value = {
    windowWidth,
    screenWidth,
    sidebarWidth,
  };

  return (
    <WidthContext.Provider value={value}>{children}</WidthContext.Provider>
  );
};

export default WidthProvider;

/**
 * Custom hook for accessing width context values
 * @throws {Error} If used outside of a WidthProvider
 * @returns {WidthContextType} The width context values
 */
export const useWidthContext = () => {
  const context = useContext(WidthContext);
  if (!context) {
    throw new Error("useWidthContext must be used within a WidthProvider");
  }
  return context;
};
