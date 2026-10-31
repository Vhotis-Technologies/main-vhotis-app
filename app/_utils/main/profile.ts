import BottomSheet from "@gorhom/bottom-sheet";
import { useMemo, useRef, useState } from "react";

const useProfile = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "50%"], []);
  const [isAccoutHolderPressed, setIsAccoutHolderPressed] = useState(false);

  const openBottomSheet = () => {
    if (isAccoutHolderPressed) {
      bottomSheetRef.current?.close();
    } else {
      bottomSheetRef.current?.expand();
    }
    setIsAccoutHolderPressed(!isAccoutHolderPressed);
  };

  const closeBottomSheet = () => {
    bottomSheetRef.current?.close();
  };

  return {
    bottomSheetRef,
    snapPoints,
    openBottomSheet,
    closeBottomSheet,
    isAccoutHolderPressed,
    setIsAccoutHolderPressed,
  };
};

export default useProfile;
